import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/seed-admins')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get('x-seed-secret')
        if (secret !== 'tmp-seed-9f3a71c2') {
          return new Response('Unauthorized', { status: 401 })
        }
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
        const email = 'morris@cevons.com'
        const password = 'cevons123'

        let userId: string | null = null
        const created = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { must_change_password: true },
        })
        if (created.error) {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
          const existing = list?.users.find((u) => u.email?.toLowerCase() === email)
          if (!existing) return new Response(created.error.message, { status: 500 })
          userId = existing.id
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: { must_change_password: true },
          })
        } else {
          userId = created.data.user!.id
        }

        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId)
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' as never })
        if (roleError) return new Response(roleError.message, { status: 500 })

        return Response.json({ ok: true, userId })
      },
    },
  },
})
