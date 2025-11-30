import { NextRequest, NextResponse } from 'next/server';
import { 
  getInstagramAccessToken, 
  getFacebookUser, 
  getFacebookPages,
  getFacebookPageById,
  getInstagramAccount 
} from '@/lib/social/instagram';
import { prisma } from '@/lib/prisma';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');

    if (error) {
      console.error('[INSTAGRAM] OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/admin/social?error=${encodeURIComponent(errorDescription || error)}`,
          BASE_URL
        )
      );
    }

    if (!code) {
      const expectedRedirectUri = `${BASE_URL.replace(/\/+$/, '')}/api/social/callback/instagram`;
      const actualCallbackUrl = request.url;
      
      console.error('[INSTAGRAM] No authorization code received in callback');
      console.error('[INSTAGRAM] Expected redirect URI:', expectedRedirectUri);
      console.error('[INSTAGRAM] Actual callback URL:', actualCallbackUrl);
      console.error('[INSTAGRAM] Query params:', Object.fromEntries(request.nextUrl.searchParams));
      
      // Check if there's an error in the query params
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (errorParam) {
        console.error('[INSTAGRAM] Facebook OAuth error:', errorParam, errorDescription);
        let errorMsg = `Facebook OAuth error: ${errorDescription || errorParam}`;
        
        // Provide helpful guidance for common errors
        if (errorDescription?.includes('redirect_uri') || errorParam === 'redirect_uri_mismatch') {
          errorMsg += `\n\n❌ Redirect URI Mismatch!\n\n` +
            `Expected redirect URI: ${expectedRedirectUri}\n\n` +
            `To fix this:\n` +
            `1. Go to Facebook App → Products → Facebook Login → Settings\n` +
            `2. Under "Valid OAuth Redirect URIs", add EXACTLY:\n` +
            `   ${expectedRedirectUri}\n` +
            `3. Also add to "App Domains" (without https://):\n` +
            `   ${BASE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}\n` +
            `4. Click "Save Changes" and wait 2-3 minutes for changes to propagate`;
        }
        
        return NextResponse.redirect(
          new URL(`/admin/social?error=${encodeURIComponent(errorMsg)}`, BASE_URL)
        );
      }
      
      return NextResponse.redirect(
        new URL(`/admin/social?error=${encodeURIComponent(`OAuth callback did not receive authorization code. Expected redirect URI: ${expectedRedirectUri}. Make sure this EXACT URI is added in Facebook Login → Settings → Valid OAuth Redirect URIs.`)}`, BASE_URL)
      );
    }

    try {
      // Exchange code for access token
      console.log('[INSTAGRAM] Exchanging authorization code for access token...');
      const tokenData = await getInstagramAccessToken(code);
      
      // Get Facebook user profile
      console.log('[INSTAGRAM] Fetching Facebook user profile...');
      const facebookUser = await getFacebookUser(tokenData.access_token);
      
      // Debug: Check what permissions the token actually has
      console.log('[INSTAGRAM] Debugging token permissions...');
      let hasPagesShowList = false;
      let grantedScopes: string[] = [];
      let pageId: string | null = null;
      let instagramAccountId: string | null = null;
      try {
        if (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET) {
          const debugUrl = `https://graph.facebook.com/v19.0/debug_token?input_token=${encodeURIComponent(tokenData.access_token)}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`;
          const debugResponse = await fetch(debugUrl);
          if (debugResponse.ok) {
            const debugData = await debugResponse.json();
            console.log('[INSTAGRAM] Token debug info:', JSON.stringify(debugData, null, 2));
            if (debugData.data?.scopes) {
              grantedScopes = debugData.data.scopes || [];
              console.log('[INSTAGRAM] Granted scopes:', grantedScopes.join(', '));
              hasPagesShowList = grantedScopes.includes('pages_show_list');
              console.log('[INSTAGRAM] Has pages_show_list permission:', hasPagesShowList);
              
              // Extract Page ID and Instagram Account ID from granular_scopes
              if (debugData.data?.granular_scopes) {
                const granularScopes = debugData.data.granular_scopes || [];
                console.log('[INSTAGRAM] Granular scopes:', JSON.stringify(granularScopes, null, 2));
                
                for (const granular of granularScopes) {
                  if (granular.scope === 'pages_show_list' && granular.target_ids && granular.target_ids.length > 0) {
                    pageId = granular.target_ids[0];
                    console.log('[INSTAGRAM] Found Page ID from granular_scopes:', pageId);
                  }
                  if ((granular.scope === 'instagram_basic' || granular.scope === 'instagram_content_publish') 
                      && granular.target_ids && granular.target_ids.length > 0) {
                    instagramAccountId = granular.target_ids[0];
                    console.log('[INSTAGRAM] Found Instagram Account ID from granular_scopes:', instagramAccountId);
                  }
                }
              }
              
              if (!hasPagesShowList) {
                console.error('[INSTAGRAM] WARNING: Token does NOT have pages_show_list permission!');
              }
            }
          } else {
            const debugError = await debugResponse.text();
            console.warn('[INSTAGRAM] Could not debug token:', debugError);
          }
        }
      } catch (debugError) {
        console.warn('[INSTAGRAM] Could not debug token:', debugError);
      }
      
      // Get Facebook Pages (Instagram accounts are linked to Pages)
      console.log('[INSTAGRAM] Fetching Facebook Pages with user access token...');
      console.log('[INSTAGRAM] Token type:', tokenData.token_type || 'Bearer', 'Expires in:', tokenData.expires_in || 'N/A');
      console.log('[INSTAGRAM] Facebook User ID:', facebookUser.id);
      
      let pages: any[] = [];
      
      // If we have a Page ID from granular_scopes, query that specific page directly
      if (pageId) {
        console.log('[INSTAGRAM] Using Page ID from granular_scopes:', pageId);
        try {
          const pageInfo = await getFacebookPageById(tokenData.access_token, pageId);
          if (pageInfo) {
            pages = [pageInfo];
            console.log('[INSTAGRAM] Successfully retrieved page from granular_scopes Page ID');
          }
        } catch (pageError) {
          console.error('[INSTAGRAM] Failed to get page by ID, falling back to /me/accounts:', pageError);
        }
      }
      
      // If we don't have pages yet, try standard approach
      if (pages.length === 0) {
        // Try with user ID first, fallback to /me
        pages = await getFacebookPages(tokenData.access_token, facebookUser.id);
        
        // If empty, try with /me endpoint as fallback
        if (pages.length === 0) {
          console.warn('[INSTAGRAM] No pages with user ID endpoint, trying /me endpoint...');
          pages = await getFacebookPages(tokenData.access_token);
        }
      }
      
      console.log('[INSTAGRAM] Total pages retrieved:', pages.length);
      console.log('[INSTAGRAM] Pages details:', pages.map((p: any) => ({ id: p.id, name: p.name, hasInstagram: !!p.instagram_business_account })));
      
      if (pages.length === 0) {
        console.error('[INSTAGRAM] No Facebook Pages found at all');
        console.error('[INSTAGRAM] This means either:\n' +
          '1. The user access token doesn\'t have pages_show_list permission\n' +
          '2. The user didn\'t grant access to any Pages during OAuth\n' +
          '3. The user doesn\'t manage any Pages');
        
        let errorMessage = 'No Facebook Pages found. ';
        if (hasPagesShowList) {
          errorMessage += `\n\n✅ Permission granted: pages_show_list\n` +
            `❌ But no pages returned by Facebook Graph API\n\n` +
            `This is unusual - the permission is granted but the API is returning empty results.\n\n` +
            `Possible causes:\n` +
            `1. There may be a delay in permission propagation (try waiting 1-2 minutes and reconnect)\n` +
            `2. The access token may not have page-level permissions yet\n` +
            `3. There may be an issue with the API endpoint or version\n\n` +
            `Troubleshooting steps:\n` +
            `1. Check server logs for detailed API response and error information\n` +
            `2. Wait 1-2 minutes and try reconnecting (permissions may need time to propagate)\n` +
            `3. Verify in Business Integrations that "Show a list of the Pages you manage" is checked\n` +
            `4. Try removing and re-adding the app in Business Integrations\n` +
            `5. Make sure you clicked "Save" on the OAuth permission screen`;
        } else {
          errorMessage += `The token does NOT have the 'pages_show_list' permission. `;
          errorMessage += `Granted scopes: ${grantedScopes.length > 0 ? grantedScopes.join(', ') : 'none'}. `;
          errorMessage += `\n\nEnable the permission:\n` +
            `1. Go to: https://www.facebook.com/settings?tab=business_tools\n` +
            `2. Find your app, click "View and edit"\n` +
            `3. Check the box for "Show a list of the Pages you manage"\n` +
            `4. Click "Save"\n` +
            `5. Then reconnect Instagram`;
        }
        
        return NextResponse.redirect(
          new URL(
            '/admin/social?error=' + encodeURIComponent(errorMessage),
            BASE_URL
          )
        );
      }

      // If we have Instagram Account ID from granular_scopes but page doesn't have it linked in response,
      // we can still use it directly
      if (pages.length > 0 && instagramAccountId && !pages[0].instagram_business_account) {
        console.log('[INSTAGRAM] Page found but missing Instagram account in response, using ID from granular_scopes:', instagramAccountId);
        pages[0].instagram_business_account = {
          id: instagramAccountId,
          username: '', // Will be fetched below
        };
      }
      
      // Find pages with Instagram Business accounts
      const pagesWithInstagram = pages.filter((page) => page.instagram_business_account);
      console.log('[INSTAGRAM] Pages with Instagram accounts:', pagesWithInstagram.length);
      console.log('[INSTAGRAM] Pages WITHOUT Instagram accounts:', pages.filter((p: any) => !p.instagram_business_account).map((p: any) => p.name));
      
      if (pagesWithInstagram.length === 0) {
        const pageNames = pages.map((p: any) => `${p.name} (ID: ${p.id})`).join(', ');
        console.error('[INSTAGRAM] No pages have Instagram accounts linked.');
        console.error('[INSTAGRAM] Pages found:', pageNames);
        
        // If we have pageId and instagramAccountId from granular_scopes, we can still proceed
        if (pageId && instagramAccountId && pages.length > 0) {
          console.log('[INSTAGRAM] Using Page ID and Instagram Account ID from granular_scopes to continue...');
          pages[0].instagram_business_account = {
            id: instagramAccountId,
            username: '', // Will be fetched
          };
        } else {
          return NextResponse.redirect(
            new URL(
              '/admin/social?error=' + encodeURIComponent(
                `Found ${pages.length} Facebook Page(s) (${pages.map((p: any) => p.name || 'Unknown').join(', ')}), but none have Instagram accounts linked.\n\n` +
                'To fix this:\n' +
                '1. Open your Instagram mobile app\n' +
                '2. Go to Settings → Business → Page\n' +
                '3. Link your Instagram account to the Facebook Page\n' +
                '4. Make sure your Instagram account is a Business or Creator account (not personal)\n' +
                '5. Then try connecting again'
              ),
              BASE_URL
            )
          );
        }
      }

      // Use the first page with Instagram (or the one we just enhanced)
      const pageWithInstagram = pages.find((p) => p.instagram_business_account) || pages[0];
      console.log('[INSTAGRAM] Using page with Instagram:', pageWithInstagram?.name || pageWithInstagram?.id, 'Instagram account:', pageWithInstagram?.instagram_business_account?.id);

      // Get Instagram account details
      console.log('[INSTAGRAM] Fetching Instagram account details...');
      const instagramAccount = await getInstagramAccount(
        pageWithInstagram.access_token,
        pageWithInstagram.instagram_business_account!.id
      );

      // Calculate expiration date (long-lived tokens expire in 60 days)
      const expiresIn = tokenData.expires_in || 60 * 24 * 60 * 60; // Default to 60 days
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Store or update connection in database
      // We'll store both the user access token and page access token
      // The page access token is what we need for posting to Instagram
      const username = instagramAccount.username || `instagram_${instagramAccount.id}`;
      const profileImage = null; // Instagram Graph API doesn't provide profile image in basic endpoint

      // Store the connection with page access token (needed for Instagram API)
      // Store Instagram account ID in username field as "username|instagram_id|page_id" for retrieval
      const usernameWithIds = `${username}|${instagramAccount.id}|${pageWithInstagram.id}`;
      
      await prisma.socialConnection.upsert({
        where: { platform: 'instagram' },
        create: {
          platform: 'instagram',
          accessToken: pageWithInstagram.access_token, // Use page access token for Instagram API
          refreshToken: tokenData.access_token, // Store user token as refresh token
          expiresAt,
          isActive: true,
          username: usernameWithIds, // Store "username|instagram_id|page_id"
          profileImage,
        },
        update: {
          accessToken: pageWithInstagram.access_token,
          refreshToken: tokenData.access_token,
          expiresAt,
          isActive: true,
          username: usernameWithIds,
          profileImage,
        },
      });

      console.log('[INSTAGRAM] Connection stored successfully');

      // Redirect back to admin panel
      return NextResponse.redirect(
        new URL('/admin/social?connected=instagram', BASE_URL)
      );
    } catch (error: any) {
      console.error('[INSTAGRAM] Error during Instagram OAuth callback:', error);
      return NextResponse.redirect(
        new URL(
          `/admin/social?error=${encodeURIComponent(error.message || 'oauth_failed')}`,
          BASE_URL
        )
      );
    }
  } catch (error: any) {
    console.error('[INSTAGRAM] Error in Instagram callback route:', error);
    return NextResponse.redirect(
      new URL('/admin/social?error=server_error', BASE_URL)
    );
  }
}