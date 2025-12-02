import { prisma } from './prisma';

export interface AiIntegration {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  model: string | null;
  isActive: boolean;
}

export interface GeneratePostOptions {
  blogContent?: string;
  blogTitle?: string;
  blogExcerpt?: string;
  prompt: string;
  platform: string;
  aiIntegrationId: string;
  count?: number; // Number of posts to generate (default: 1)
}

export interface RefinePostOptions {
  content: string;
  refinementPrompt: string;
  aiIntegrationId: string;
}

export interface GenerateIdeasOptions {
  prompt: string;
  aiIntegrationId: string;
  count?: number; // Number of ideas to generate
}

/**
 * Get AI integration by ID
 */
export async function getAiIntegration(id: string): Promise<AiIntegration | null> {
  const integration = await prisma.aiIntegration.findUnique({
    where: { id },
  });
  
  if (!integration) return null;
  
  return {
    id: integration.id,
    name: integration.name,
    provider: integration.provider,
    apiKey: integration.apiKey, // Note: In production, decrypt this
    model: integration.model || null,
    isActive: integration.isActive,
  };
}

/**
 * Get active AI integrations
 */
export async function getActiveAiIntegrations(): Promise<AiIntegration[]> {
  const integrations = await prisma.aiIntegration.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  
  type AiIntegrationType = Awaited<ReturnType<typeof prisma.aiIntegration.findMany>>[0];
  
  return integrations.map((integration: AiIntegrationType) => ({
    id: integration.id,
    name: integration.name,
    provider: integration.provider,
    apiKey: integration.apiKey, // Note: In production, decrypt this
    model: integration.model || null,
    isActive: integration.isActive,
  }));
}

/**
 * Generate post content using AI
 */
export async function generatePost(options: GeneratePostOptions): Promise<string> {
  const count = options.count || 1;
  
  // If generating multiple posts, use the dedicated function
  if (count > 1) {
    const posts = await generateMultiplePosts(options);
    return posts[0]; // Return first post for backward compatibility
  }
  
  const integration = await getAiIntegration(options.aiIntegrationId);
  
  if (!integration || !integration.isActive) {
    throw new Error('AI integration not found or inactive');
  }
  
  if (!integration.apiKey || integration.apiKey.trim() === '') {
    throw new Error('API key is missing for this AI integration. Please update the integration with a valid API key.');
  }
  
  // Build the prompt based on the blog content and user prompt
  let systemPrompt = '';
  let userPrompt = '';
  
  if (options.blogContent || options.blogTitle) {
    systemPrompt = `You are a social media content creator. Generate engaging social media posts based on blog content.`;
    userPrompt = `Create a ${options.platform} post based on the following blog:\n\n`;
    
    if (options.blogTitle) {
      userPrompt += `Title: ${options.blogTitle}\n\n`;
    }
    if (options.blogExcerpt) {
      userPrompt += `Excerpt: ${options.blogExcerpt}\n\n`;
    }
    if (options.blogContent) {
      // Strip HTML tags for AI processing
      const textContent = options.blogContent.replace(/<[^>]*>/g, '').substring(0, 3000);
      userPrompt += `Content: ${textContent}\n\n`;
    }
    
    userPrompt += `User Instructions: ${options.prompt}\n\n`;
    userPrompt += `Platform: ${options.platform}\n\n`;
    userPrompt += `Generate a compelling ${options.platform} post that follows the user's instructions. Make it engaging, authentic, and appropriate for the platform.\n\n`;
    userPrompt += `IMPORTANT FORMATTING REQUIREMENTS:\n`;
    userPrompt += `- Use proper paragraph breaks (double line breaks) to separate different ideas or sections\n`;
    userPrompt += `- Break up long sentences into readable paragraphs\n`;
    userPrompt += `- Each paragraph should be separated by a blank line\n`;
    userPrompt += `- Keep paragraphs concise (2-4 sentences each)\n`;
    userPrompt += `- Format hashtags on a separate line at the end if applicable`;
  } else {
    systemPrompt = `You are a social media content creator. Generate engaging social media posts.`;
    userPrompt = `${options.prompt}\n\nPlatform: ${options.platform}\n\nGenerate a compelling ${options.platform} post.\n\n`;
    userPrompt += `IMPORTANT FORMATTING REQUIREMENTS:\n`;
    userPrompt += `- Use proper paragraph breaks (double line breaks) to separate different ideas or sections\n`;
    userPrompt += `- Break up long sentences into readable paragraphs\n`;
    userPrompt += `- Each paragraph should be separated by a blank line\n`;
    userPrompt += `- Keep paragraphs concise (2-4 sentences each)\n`;
    userPrompt += `- Format hashtags on a separate line at the end if applicable`;
  }
  
  // Call the appropriate AI provider
  let result: string;
  switch (integration.provider) {
    case 'openai':
      result = await generateWithOpenAI(integration.apiKey, integration.model || 'gpt-4', systemPrompt, userPrompt);
      break;
    case 'google':
      // Use gemini-pro as default (more widely supported) or user-specified model
      result = await generateWithGoogle(integration.apiKey, integration.model || 'gemini-pro', systemPrompt, userPrompt);
      break;
    case 'anthropic':
      result = await generateWithAnthropic(integration.apiKey, integration.model || 'claude-3-opus-20240229', systemPrompt, userPrompt);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${integration.provider}`);
  }
  
  // Post-process to ensure proper paragraph formatting
  return formatPostWithParagraphs(result);
}

/**
 * Remove indentation from content while preserving paragraph structure
 */
function removeIndentation(content: string): string {
  if (!content) return content;
  
  // Split into lines
  const lines = content.split('\n');
  
  // Find the minimum indentation (excluding empty lines)
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length > 0) {
      const indent = line.match(/^\s*/)?.[0].length || 0;
      if (indent < minIndent) {
        minIndent = indent;
      }
    }
  }
  
  // If no indentation found, return as is
  if (minIndent === Infinity || minIndent === 0) {
    return content;
  }
  
  // Remove the minimum indentation from each line
  return lines.map(line => {
    if (line.trim().length === 0) {
      return line; // Preserve empty lines
    }
    return line.substring(minIndent);
  }).join('\n');
}

/**
 * Format post content with proper paragraph breaks
 */
function formatPostWithParagraphs(content: string): string {
  if (!content) return content;
  
  // First remove indentation
  content = removeIndentation(content);
  
  // Normalize line breaks
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  
  // If content already has proper paragraph breaks (double newlines), preserve them
  if (content.includes('\n\n')) {
    // Clean up any triple+ newlines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Ensure hashtags are on a separate line
    content = content.replace(/\s+(#[^\s]+(?:\s+#[^\s]+)*)/g, '\n\n$1');
    
    return content.trim();
  }
  
  // If no paragraph breaks exist, add them intelligently
  let formatted = content;
  
  // 1. Add breaks before hashtags (if they're not already separated)
  formatted = formatted.replace(/([^\n])\s+(#[^\s]+(?:\s+#[^\s]+)*)/g, '$1\n\n$2');
  
  // 2. Add breaks after sentence endings that are followed by long sentences
  // Look for: sentence ending + space + capital letter + long text (150+ chars)
  formatted = formatted.replace(/([.!?])\s+([A-Z][^.!?]{150,})/g, '$1\n\n$2');
  
  // 3. Add breaks after quotes that end sentences
  formatted = formatted.replace(/("|"|'|')\s+([A-Z][^.!?]{80,})/g, '$1\n\n$2');
  
  // 4. If still no breaks and content is long, add breaks every 2-3 sentences
  if (!formatted.includes('\n\n') && formatted.length > 200) {
    // Split by sentence endings
    const sentences = formatted.split(/([.!?]\s+)/);
    const paragraphs: string[] = [];
    let currentPara: string[] = [];
    let charCount = 0;
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = (sentences[i] || '') + (sentences[i + 1] || '');
      if (sentence.trim()) {
        currentPara.push(sentence.trim());
        charCount += sentence.length;
        
        // Start new paragraph after ~200 chars or 2-3 sentences
        if (charCount > 200 && currentPara.length >= 2) {
          paragraphs.push(currentPara.join(' '));
          currentPara = [];
          charCount = 0;
        }
      }
    }
    
    if (currentPara.length > 0) {
      paragraphs.push(currentPara.join(' '));
    }
    
    if (paragraphs.length > 1) {
      formatted = paragraphs.join('\n\n');
    }
  }
  
  // Final cleanup: ensure hashtags are on separate line
  formatted = formatted.replace(/\s+(#[^\s]+(?:\s+#[^\s]+)*)/g, '\n\n$1');
  
  // Remove any triple+ newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  return formatted.trim();
}

/**
 * Generate multiple post contents using AI
 * Exported for use in API routes
 */
export async function generateMultiplePosts(options: GeneratePostOptions): Promise<string[]> {
  const count = options.count || 1;
  const integration = await getAiIntegration(options.aiIntegrationId);
  
  if (!integration || !integration.isActive) {
    throw new Error('AI integration not found or inactive');
  }
  
  if (!integration.apiKey || integration.apiKey.trim() === '') {
    throw new Error('API key is missing for this AI integration. Please update the integration with a valid API key.');
  }
  
  // Build the prompt based on the blog content and user prompt
  let systemPrompt = '';
  let userPrompt = '';
  
  if (options.blogContent || options.blogTitle) {
    systemPrompt = `You are a social media content creator. Generate multiple engaging social media posts based on blog content. Each post should be unique and cover different aspects or angles of the blog content.`;
    userPrompt = `Create ${count} distinct ${options.platform} posts based on the following blog:\n\n`;
    
    if (options.blogTitle) {
      userPrompt += `Title: ${options.blogTitle}\n\n`;
    }
    if (options.blogExcerpt) {
      userPrompt += `Excerpt: ${options.blogExcerpt}\n\n`;
    }
    if (options.blogContent) {
      // Strip HTML tags for AI processing
      const textContent = options.blogContent.replace(/<[^>]*>/g, '').substring(0, 3000);
      userPrompt += `Content: ${textContent}\n\n`;
    }
    
    userPrompt += `User Instructions: ${options.prompt}\n\n`;
    userPrompt += `Platform: ${options.platform}\n\n`;
    userPrompt += `Generate exactly ${count} distinct ${options.platform} posts. Each post should:\n`;
    userPrompt += `- Be unique and cover different aspects or angles\n`;
    userPrompt += `- Follow the user's instructions\n`;
    userPrompt += `- Be engaging, authentic, and appropriate for ${options.platform}\n`;
    userPrompt += `- Use proper paragraph breaks (double line breaks) to separate different ideas\n`;
    userPrompt += `- Break up long sentences into readable paragraphs (2-4 sentences per paragraph)\n`;
    userPrompt += `- Format hashtags on a separate line at the end if applicable\n`;
    userPrompt += `- Be formatted as a numbered list (1., 2., 3., etc.)\n`;
    userPrompt += `- Each post should be on its own line\n`;
    userPrompt += `- Do not include any additional text, just the numbered posts`;
  } else {
    systemPrompt = `You are a social media content creator. Generate multiple engaging social media posts.`;
    userPrompt = `Generate exactly ${count} distinct ${options.platform} posts based on: ${options.prompt}\n\n`;
    userPrompt += `Format as a numbered list (1., 2., 3., etc.), one post per line. Each post should be unique and engaging.\n\n`;
    userPrompt += `IMPORTANT FORMATTING REQUIREMENTS:\n`;
    userPrompt += `- Use proper paragraph breaks (double line breaks) to separate different ideas\n`;
    userPrompt += `- Break up long sentences into readable paragraphs (2-4 sentences per paragraph)\n`;
    userPrompt += `- Format hashtags on a separate line at the end if applicable`;
  }
  
  let response: string;
  
  // Call the appropriate AI provider
  switch (integration.provider) {
    case 'openai':
      response = await generateWithOpenAI(integration.apiKey, integration.model || 'gpt-4', systemPrompt, userPrompt);
      break;
    case 'google':
      response = await generateWithGoogle(integration.apiKey, integration.model || 'gemini-pro', systemPrompt, userPrompt);
      break;
    case 'anthropic':
      response = await generateWithAnthropic(integration.apiKey, integration.model || 'claude-3-opus-20240229', systemPrompt, userPrompt);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${integration.provider}`);
  }
  
  // Parse the response into an array of posts
  // First, try to split by numbered items (1., 2., etc.)
  const numberedPattern = /^\d+[\.\)\-]\s+/m;
  let posts: string[] = [];
  
  if (numberedPattern.test(response)) {
    // Split by numbered items
    const parts = response.split(/(?=^\d+[\.\)\-]\s+)/m);
    
    for (const part of parts) {
      if (!part.trim()) continue;
      
      // Remove numbering and clean up
      let post = part.replace(/^\d+[\.\)\-]\s+/, '').trim();
      
      // Remove markdown formatting
      post = post.replace(/^\*\s*/gm, '').trim();
      post = post.replace(/^-\s*/gm, '').trim();
      
      // Remove any leading/trailing quotes
      post = post.replace(/^["']|["']$/g, '').trim();
      
      // Filter out metadata lines
      const lowerPost = post.toLowerCase();
      if (lowerPost.includes('here are') || 
          lowerPost.includes('here\'s') ||
          lowerPost.startsWith('generate') ||
          lowerPost.includes('platform:') ||
          post.length < 10) {
        continue;
      }
      
      // Apply paragraph formatting
      post = formatPostWithParagraphs(post);
      
      if (post.length >= 10) {
        posts.push(post);
      }
    }
  } else {
    // Fallback: split by double line breaks or single lines
    const lines = response.split(/\n\n+/);
    
    for (let line of lines) {
      line = line.trim();
      
      // Remove numbering if present
      line = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
      
      // Remove markdown formatting
      line = line.replace(/^\*\s*/, '').trim();
      line = line.replace(/^-\s*/, '').trim();
      
      // Remove any leading/trailing quotes
      line = line.replace(/^["']|["']$/g, '').trim();
      
      // Filter out metadata
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('here are') || 
          lowerLine.includes('here\'s') ||
          lowerLine.startsWith('generate') ||
          lowerLine.includes('platform:') ||
          line.length < 10) {
        continue;
      }
      
      // Apply paragraph formatting
      line = formatPostWithParagraphs(line);
      
      if (line.length >= 10) {
        posts.push(line);
      }
    }
  }
  
  // Return the first N valid posts, ensuring proper formatting
  return posts.slice(0, count).map(post => formatPostWithParagraphs(post));
}

/**
 * Refine post content using AI
 */
export async function refinePost(options: RefinePostOptions): Promise<string> {
  const integration = await getAiIntegration(options.aiIntegrationId);
  
  if (!integration || !integration.isActive) {
    throw new Error('AI integration not found or inactive');
  }
  
  if (!integration.apiKey || integration.apiKey.trim() === '') {
    throw new Error('API key is missing for this AI integration. Please update the integration with a valid API key.');
  }
  
  const systemPrompt = `You are a social media content editor. Refine and improve social media posts based on user feedback. Return ONLY the refined post content without any explanations, introductions, or additional text.`;
  const userPrompt = `Original post:\n${options.content}\n\nUser refinement request: ${options.refinementPrompt}\n\nRefine the post according to the user's request while maintaining the core message.\n\nIMPORTANT: Return ONLY the refined post content. Do not include any explanations, introductions like "Here is the refined post:" or "Refined version:", or any other text. Return the post content directly, ready to use.`;
  
  let result: string;
  switch (integration.provider) {
    case 'openai':
      result = await generateWithOpenAI(integration.apiKey, integration.model || 'gpt-4', systemPrompt, userPrompt);
      break;
    case 'google':
      // Use gemini-pro as default (more widely supported) or user-specified model
      result = await generateWithGoogle(integration.apiKey, integration.model || 'gemini-pro', systemPrompt, userPrompt);
      break;
    case 'anthropic':
      result = await generateWithAnthropic(integration.apiKey, integration.model || 'claude-3-opus-20240229', systemPrompt, userPrompt);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${integration.provider}`);
  }
  
  // Clean up the result to remove any explanatory text
  return cleanRefinedContent(result);
}

/**
 * Clean refined content to remove any explanatory text or introductions
 */
function cleanRefinedContent(content: string): string {
  if (!content) return content;
  
  // Remove common prefixes and explanations
  const prefixesToRemove = [
    /^Here is the refined post:\s*/i,
    /^Refined version:\s*/i,
    /^Refined post:\s*/i,
    /^Here's the refined post:\s*/i,
    /^Here's the refined version:\s*/i,
    /^Refined content:\s*/i,
    /^Here is the refined content:\s*/i,
    /^Here's the refined content:\s*/i,
    /^Refined:\s*/i,
    /^Here is the post:\s*/i,
    /^Here's the post:\s*/i,
    /^Post:\s*/i,
    /^Content:\s*/i,
  ];
  
  let cleaned = content.trim();
  
  // Remove prefixes
  for (const prefix of prefixesToRemove) {
    cleaned = cleaned.replace(prefix, '');
  }
  
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```[\w]*\n?/g, '').replace(/\n?```$/g, '');
  
  // Remove quotes if the entire content is wrapped in quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Format with proper paragraphs
  cleaned = formatPostWithParagraphs(cleaned);
  
  return cleaned.trim();
}

/**
 * Generate post ideas using AI
 */
export async function generateIdeas(options: GenerateIdeasOptions): Promise<string[]> {
  const integration = await getAiIntegration(options.aiIntegrationId);
  
  if (!integration || !integration.isActive) {
    throw new Error('AI integration not found or inactive');
  }
  
  if (!integration.apiKey || integration.apiKey.trim() === '') {
    throw new Error('API key is missing for this AI integration. Please update the integration with a valid API key.');
  }
  
  const count = options.count || 5;
  const systemPrompt = `You are a social media content strategist. Generate creative and engaging post ideas with detailed descriptions. Return ONLY the ideas, one per line, numbered. Do not include any additional text, explanations, or metadata.`;
  const userPrompt = `Generate exactly ${count} distinct social media post ideas based on this topic: "${options.prompt}"

Format requirements:
- Each idea should include a title followed by a detailed description (2-4 sentences)
- The description should explain the concept, key points to cover, and suggested approach
- Number each idea from 1 to ${count}
- One idea per line (title and description on the same line, separated by a colon or dash)
- No additional text, explanations, or metadata
- Just the numbered list of ideas

Example format:
1. Title Here: Detailed description explaining the concept, what points to cover, and how to approach this post idea. This should be 2-4 sentences that give context and guidance.
2. Another Title: Another detailed description with context about the idea, what makes it engaging, and how to structure the content.
3. Third Title: Yet another comprehensive description that outlines the post concept, key messaging, and approach.`;
  
  let response: string;
  
  switch (integration.provider) {
    case 'openai':
      response = await generateWithOpenAI(integration.apiKey, integration.model || 'gpt-4', systemPrompt, userPrompt);
      break;
    case 'google':
      response = await generateWithGoogle(integration.apiKey, integration.model || 'gemini-pro', systemPrompt, userPrompt);
      break;
    case 'anthropic':
      response = await generateWithAnthropic(integration.apiKey, integration.model || 'claude-3-opus-20240229', systemPrompt, userPrompt);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${integration.provider}`);
  }
  
  // Parse the response into an array of ideas
  // Split by numbered items first to preserve multi-line descriptions
  const numberedPattern = /^\d+[\.\)\-]\s+/m;
  let ideas: string[] = [];
  
  if (numberedPattern.test(response)) {
    // Split by numbered items, preserving the full content of each idea
    const parts = response.split(/(?=^\d+[\.\)\-]\s+)/m);
    
    for (const part of parts) {
      if (!part.trim()) continue;
      
      // Remove numbering and clean up
      let idea = part.replace(/^\d+[\.\)\-]\s+/, '').trim();
      
      // Remove markdown formatting but preserve line breaks within the idea
      idea = idea.replace(/^\*\s*/gm, '').trim();
      idea = idea.replace(/^-\s*/gm, '').trim();
      idea = idea.replace(/\*\*/g, '').trim();
      
      // Remove any leading/trailing quotes
      idea = idea.replace(/^["']|["']$/g, '').trim();
      
      // Filter out metadata
      const lowerIdea = idea.toLowerCase();
      if (lowerIdea.includes('generate post ideas') || 
          lowerIdea.includes('generate ideas') ||
          lowerIdea.includes('here are') || 
          lowerIdea.includes('here\'s') ||
          lowerIdea.includes('business post idea') ||
          lowerIdea.startsWith('generate posts') ||
          lowerIdea.includes('prompt:') ||
          idea.length < 10) {
        continue;
      }
      
      // Normalize whitespace (multiple spaces to single, but preserve line breaks)
      idea = idea.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      
      if (idea.length >= 10) {
        ideas.push(idea);
      }
    }
  } else {
    // Fallback: split by double line breaks or single lines
    const lines = response.split(/\n\n+/);
    
    for (let line of lines) {
      line = line.trim();
      
      // Remove numbering if present
      line = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
      
      // Remove markdown formatting
      line = line.replace(/^\*\s*/, '').trim();
      line = line.replace(/^-\s*/, '').trim();
      line = line.replace(/\*\*/g, '').trim();
      
      // Remove any leading/trailing quotes
      line = line.replace(/^["']|["']$/g, '').trim();
      
      // Filter out metadata
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('generate post ideas') || 
          lowerLine.includes('generate ideas') ||
          lowerLine.includes('here are') || 
          lowerLine.includes('here\'s') ||
          lowerLine.includes('business post idea') ||
          lowerLine.startsWith('generate posts') ||
          lowerLine.includes('prompt:') ||
          line.length < 10) {
        continue;
      }
      
      // Normalize whitespace
      line = line.replace(/[ \t]+/g, ' ').trim();
      
      if (line.length >= 10) {
        ideas.push(line);
      }
    }
  }
  
  // Take the first N valid ideas, preserving their full content
  return ideas
    .slice(0, count)
    .map(idea => {
      // Clean up any remaining artifacts but keep the full content
      idea = idea.replace(/^["']|["']$/g, '').trim();
      return idea;
    })
    .filter(idea => idea.length >= 10); // Filter for valid ideas (minimum 10 chars)
}

export interface AnalyzeEmailOptions {
  emailId?: string;
  threadId?: string;
  aiIntegrationId: string;
}

/**
 * Analyze email thread and generate tasks with priority levels
 * Analyzes the entire thread as a single conversation for better context
 */
export async function analyzeEmailAndGenerateTasks(options: AnalyzeEmailOptions): Promise<Array<{
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
}>> {
  const integration = await getAiIntegration(options.aiIntegrationId);
  
  if (!integration || !integration.isActive) {
    throw new Error('AI integration not found or inactive');
  }
  
  if (!integration.apiKey || integration.apiKey.trim() === '') {
    throw new Error('API key is missing for this AI integration. Please update the integration with a valid API key.');
  }

  // Get all emails in the thread
  let threadEmails;
  if (options.threadId) {
    // Get all emails in the thread
    threadEmails = await prisma.email.findMany({
      where: { threadId: options.threadId },
      orderBy: { receivedAt: 'asc' }, // Oldest first to show conversation flow
    });
    
    if (threadEmails.length === 0) {
      throw new Error('Thread not found');
    }
  } else if (options.emailId) {
    // Fallback: get single email and its thread
    const { getEmail } = await import('./data');
    const email = await getEmail(options.emailId);
    
    if (!email) {
      throw new Error('Email not found');
    }
    
    if (email.threadId) {
      // Get all emails in the thread
      threadEmails = await prisma.email.findMany({
        where: { threadId: email.threadId },
        orderBy: { receivedAt: 'asc' },
      });
    } else {
      // Single email without thread
      threadEmails = [email];
    }
  } else {
    throw new Error('Either emailId or threadId must be provided');
  }

  // Build conversation context from all emails in thread
  const conversationParts: string[] = [];
  for (const email of threadEmails) {
    const emailContent = email.bodyText || email.body || email.snippet || '';
    const emailSubject = email.subject || '';
    const emailFrom = email.from || '';
    const receivedAt = new Date(email.receivedAt).toLocaleString();
    
    conversationParts.push(
      `[${receivedAt}] From: ${emailFrom}\nSubject: ${emailSubject}\n\n${emailContent.substring(0, 3000)}`
    );
  }
  
  const conversationContext = conversationParts.join('\n\n---\n\n');
  const latestEmail = threadEmails[threadEmails.length - 1];
  const threadSubject = latestEmail.subject || '';
  const threadFrom = latestEmail.from || '';

  const systemPrompt = `You are an email analysis assistant for Engjell Rraklli and division5. Analyze email threads (conversations) and extract actionable tasks that are relevant to Engjell Rraklli or division5. For each task, determine its priority:
- HIGH: Urgent actions, deadlines, important requests, time-sensitive items
- MEDIUM: Important but not urgent, follow-ups needed, standard requests
- LOW: Nice-to-have items, informational tasks, optional actions

CRITICAL RULES:
1. ONLY create tasks if there are actual actionable items that require Engjell Rraklli or division5 to DO something
2. Only create tasks about Engjell Rraklli or division5 in relationship to others - do NOT create tasks about other people or companies unless they relate to actions Engjell Rraklli or division5 need to take
3. If the email thread is purely informational, contains only acknowledgments, confirmations, or updates with no action required, return an EMPTY array: []
4. For email threads, consolidate all related actions into a SINGLE comprehensive task
5. Do NOT create multiple tasks for the same action or related actions mentioned in different messages
6. Do NOT create tasks for things that are already completed or just informational updates
7. Focus on tasks where Engjell Rraklli or division5 are the ones who need to take action

Return tasks in JSON format: [{"title": "Task title", "description": "Task details", "priority": "high|medium|low"}] or [] if no actionable tasks exist for Engjell Rraklli or division5.`;

  const userPrompt = `Analyze this email thread (conversation) and extract actionable tasks with priorities:

Thread Subject: ${threadSubject}
Thread From: ${threadFrom}
Number of messages in thread: ${threadEmails.length}

Full conversation:
${conversationContext.substring(0, 10000)}

CONTEXT - You are analyzing emails for Engjell Rraklli and division5. 
- Only create tasks that are about Engjell Rraklli or division5 in relationship to others
- Do NOT create tasks about other people, companies, or entities unless they relate to actions that Engjell Rraklli or division5 need to take
- Focus on tasks where Engjell Rraklli or division5 are the ones who need to take action

CRITICAL INSTRUCTIONS:
1. FIRST determine if there are ANY actionable items that require Engjell Rraklli or division5 to take action
2. If the thread is purely informational (updates, confirmations, acknowledgments, status reports with no action required), return an EMPTY array: []
3. If there are actionable items for Engjell Rraklli or division5, consolidate all related actions from the entire thread into a SINGLE task
4. Do NOT create duplicate tasks - if multiple messages mention the same action or related actions, combine them into one task
5. Include ALL relevant details and action items in the task description
6. The task title should be a clear, comprehensive summary of what needs to be done
7. The task description should list ALL specific items, documents, or actions mentioned across the thread

Return a JSON array of tasks. Each task must have:
- title: A clear, actionable task title that summarizes all related actions
- description: Complete description listing ALL items/actions mentioned in the thread (e.g., "Complete and return: [list all documents/items mentioned]")
- priority: "high", "medium", or "low" based on the most urgent item

IMPORTANT: 
- Only create tasks for items that require ACTION by Engjell Rraklli or division5 (doing something, completing something, responding with action, etc.)
- Do NOT create tasks for informational emails, confirmations, or updates with no action required
- Do NOT create tasks about other people or companies unless they relate to actions Engjell Rraklli or division5 need to take
- If no actionable tasks exist for Engjell Rraklli or division5, return: []
- Return ONLY valid JSON, no additional text.`;

  let response: string;
  
  switch (integration.provider) {
    case 'openai':
      response = await generateWithOpenAI(integration.apiKey, integration.model || 'gpt-4', systemPrompt, userPrompt);
      break;
    case 'google':
      response = await generateWithGoogle(integration.apiKey, integration.model || 'gemini-pro', systemPrompt, userPrompt);
      break;
    case 'anthropic':
      response = await generateWithAnthropic(integration.apiKey, integration.model || 'claude-3-opus-20240229', systemPrompt, userPrompt);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${integration.provider}`);
  }

  // Parse JSON response
  try {
    // Clean response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const tasks = JSON.parse(cleanedResponse);
    
    if (!Array.isArray(tasks)) {
      throw new Error('Response is not an array');
    }
    
    // Validate and normalize tasks
    return tasks
      .filter((task: any) => task && task.title && task.priority)
      .map((task: any) => ({
        title: String(task.title).trim(),
        description: task.description ? String(task.description).trim() : undefined,
        priority: ['high', 'medium', 'low'].includes(task.priority?.toLowerCase())
          ? (task.priority.toLowerCase() as 'low' | 'medium' | 'high')
          : 'medium' as 'low' | 'medium' | 'high',
      }));
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', response);
    throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
  }
}

/**
 * Generate content with OpenAI
 */
async function generateWithOpenAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`OpenAI API error: ${error.error?.message || JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Generate content with Google Gemini
 */
async function generateWithGoogle(apiKey: string, model: string, systemPrompt: string, userPrompt: string, isRetry: boolean = false): Promise<string> {
  // Validate API key
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Google Gemini API key is required');
  }
  
  // For Gemini, we combine system and user prompts
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
  // Normalize model name - handle common variations and strip prefixes
  let normalizedModel = model.trim();
  
  // Remove "models/" prefix if present
  if (normalizedModel.startsWith('models/')) {
    normalizedModel = normalizedModel.replace('models/', '');
  }
  
  // Handle specific model name mappings
  if (normalizedModel === 'gemini-1.5-pro' || normalizedModel === 'gemini-2.0-flash' || normalizedModel === 'gemini-2.0-pro') {
    // For newer models, try the latest version, but fallback to gemini-pro if not found
    // Keep the original name first, will fallback if 404
  } else if (!normalizedModel.includes('gemini') || normalizedModel === '') {
    // If no model specified or invalid, use a safe default
    normalizedModel = 'gemini-pro';
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt,
          }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });
    
    if (!response.ok) {
      let errorData;
      const text = await response.text();
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { error: { message: text || `HTTP ${response.status}: ${response.statusText}` } };
      }
      
      // If 404 and not already retrying, try fallback model
      if (response.status === 404 && !isRetry && normalizedModel !== 'gemini-pro') {
        console.log(`Model ${normalizedModel} not found, trying fallback: gemini-pro`);
        return await generateWithGoogle(apiKey, 'gemini-pro', systemPrompt, userPrompt, true);
      }
      
      // If 403 or 401, it's likely an API key issue
      if (response.status === 403 || response.status === 401) {
        throw new Error('Invalid or missing Google Gemini API key. Please check your API key in the AI Integrations settings.');
      }
      
      const errorMessage = errorData.error?.message || errorData.message || JSON.stringify(errorData);
      throw new Error(`Google Gemini API error: ${errorMessage}`);
    }
    
    const data = await response.json();
    
    // Check for blocked content or other issues
    if (data.candidates?.[0]?.finishReason === 'SAFETY' || data.candidates?.[0]?.finishReason === 'RECITATION') {
      throw new Error(`Content was blocked by safety filters. Finish reason: ${data.candidates[0].finishReason}`);
    }
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API');
    }
    
    const text = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No text content in Gemini API response');
    }
    
    return text;
  } catch (error: any) {
    if (error.message?.includes('Google Gemini API error')) {
      throw error;
    }
    throw new Error(`Google Gemini API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generate content with Anthropic Claude
 */
async function generateWithAnthropic(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Anthropic API error: ${error.error?.message || JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  return data.content?.[0]?.text || '';
}
