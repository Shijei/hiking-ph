'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WeeklyDigestChecker({ userId }: { userId: string }) {
  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'weekly_digest')
        .gte('created_at', oneWeekAgo)

      if (count !== 0) return

      const { data: conquests } = await supabase
        .from('conquests')
        .select('mountain_id')
        .eq('user_id', userId)

      if (!conquests?.length) return

      const mountainIds = conquests.map(c => c.mountain_id)

      const { data: recentConquests } = await supabase
        .from('conquests')
        .select('mountain_id, mountains(name)')
        .in('mountain_id', mountainIds)
        .neq('user_id', userId)
        .gte('conquered_at', oneWeekAgo)

      if (!recentConquests?.length) return

      const countMap = new Map<string, { count: number; name: string }>()
      recentConquests.forEach((c: any) => {
        const entry = countMap.get(c.mountain_id)
        if (entry) {
          entry.count++
        } else {
          countMap.set(c.mountain_id, { count: 1, name: c.mountains?.name ?? '' })
        }
      })

      const sorted = [...countMap.entries()].sort((a, b) => b[1].count - a[1].count)
      if (!sorted.length) return

      const [topId, topData] = sorted[0]
      const displayName = topData.name.replace(/^Mount\s+/i, 'Mt. ')

      await supabase.from('notifications').insert({
        user_id: userId,
        actor_id: null,
        type: 'weekly_digest',
        reference_id: topId,
        message: `${topData.count} hiker${topData.count > 1 ? 's' : ''} conquered ${displayName} this week — show them some love!`,
      })
    }

    check()
  }, [userId])

  return null
}