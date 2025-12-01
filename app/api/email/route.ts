import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getEmails, getEmailThreads, EmailThreadFilters } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const grouped = searchParams.get('grouped') === 'true';

    if (grouped) {
      // Parse filters from query params
      const filters: EmailThreadFilters = {
        search: searchParams.get('search') || undefined,
        readStatus: (searchParams.get('readStatus') as 'read' | 'unread' | 'all') || 'all',
        analyzedStatus: (searchParams.get('analyzedStatus') as 'analyzed' | 'unanalyzed' | 'all') || 'all',
        relevantStatus: (searchParams.get('relevantStatus') as 'relevant' | 'irrelevant' | 'all') || 'relevant',
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
        pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 20,
      };
      
      const result = await getEmailThreads(filters);
      return NextResponse.json(result);
    } else {
      const emails = await getEmails();
      return NextResponse.json({ emails });
    }
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
