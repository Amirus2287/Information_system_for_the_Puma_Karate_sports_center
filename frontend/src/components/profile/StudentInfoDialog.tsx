import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../../api/users'
import Dialog from '../ui/Dialog'
import Avatar from '../ui/Avatar'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  MapPin,
  Heart,
  Users,
  FileText,
} from 'lucide-react'

interface StudentInfoDialogProps {
  open: boolean
  onClose: () => void
  userId: number | null
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function StudentInfoDialog({ open, onClose, userId }: StudentInfoDialogProps) {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: open && !!userId,
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => usersApi.getProfile(userId!),
    enabled: open && !!userId,
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: () => usersApi.getAchievements({ user: userId }),
    enabled: open && !!userId,
  })

  const isLoading = userLoading || profileLoading

  if (!userId) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} title="Информация об ученике" className="max-w-2xl max-h-[90vh] overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : !user ? (
        <p className="text-gray-500 py-4">Не удалось загрузить данные</p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <Avatar
              src={user.avatar || undefined}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-14 h-14 shrink-0"
              fallback={`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user.last_name} {user.first_name}{(user as any).patronymic ? ` ${(user as any).patronymic}` : ''}
              </h2>
              <p className="text-sm text-gray-600">{user.username}</p>
              {user.age != null && (
                <p className="text-sm text-gray-600">Возраст: {user.age} лет</p>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <section className="p-4 border border-gray-200 rounded-xl">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <User className="w-4 h-4 text-primary-600" />
                Основная информация
              </h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {user.email || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Телефон</dt>
                  <dd className="text-gray-900 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {user.phone || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Дата рождения</dt>
                  <dd className="text-gray-900 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {user.date_of_birth ? formatDate(user.date_of_birth) : '—'}
                  </dd>
                </div>
              </dl>
            </section>

            {profile && (
              <>
                <section className="p-4 border border-gray-200 rounded-xl">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                    <FileText className="w-4 h-4 text-primary-600" />
                    Профиль
                  </h3>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Город</dt>
                      <dd className="text-gray-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {profile.location || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Разряд/Кю/Дан</dt>
                      <dd className="text-gray-900">{profile.grade || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Лет занятий</dt>
                      <dd className="text-gray-900">{profile.years_of_practice ?? '—'}</dd>
                    </div>
                    {(profile as any).medical_insurance && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Мед. страховка</dt>
                        <dd className="text-gray-900">{(profile as any).medical_insurance}</dd>
                      </div>
                    )}
                    {profile.bio && (
                      <div>
                        <dt className="text-gray-500 mb-1">Биография</dt>
                        <dd className="text-gray-900 text-sm">{profile.bio}</dd>
                      </div>
                    )}
                  </dl>
                </section>

                <section className="p-4 border border-gray-200 rounded-xl">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                    <Users className="w-4 h-4 text-primary-600" />
                    Контакт родителя
                  </h3>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Имя родителя</dt>
                      <dd className="text-gray-900">{profile.parent_name || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Телефон родителя</dt>
                      <dd className="text-gray-900">{profile.parent_phone || '—'}</dd>
                    </div>
                  </dl>
                </section>

                {profile.medical_notes && (
                  <section className="p-4 border border-gray-200 rounded-xl">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                      <Heart className="w-4 h-4 text-primary-600" />
                      Медицинские показания
                    </h3>
                    <p className="text-sm text-gray-700">{profile.medical_notes}</p>
                  </section>
                )}
              </>
            )}

            <section className="p-4 border border-gray-200 rounded-xl">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <Award className="w-4 h-4 text-primary-600" />
                Достижения
              </h3>
              {achievements?.length ? (
                <ul className="space-y-4">
                  {achievements.map((a: any) => {
                    const imageUrl = a.image 
                      ? (a.image.startsWith('http') 
                          ? a.image 
                          : a.image.startsWith('/') ? a.image : `/${a.image}`)
                      : null
                    return (
                      <li key={a.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="font-medium text-gray-900">{a.title}</span>
                          <span className="text-gray-500 shrink-0 text-xs">{formatDate(a.date)}</span>
                        </div>
                        {a.description && (
                          <p className="text-sm text-gray-600 mb-2">{a.description}</p>
                        )}
                        {imageUrl && (
                          <div className="mt-2">
                            <img
                              src={imageUrl}
                              alt={a.title}
                              className="w-full max-w-md h-auto rounded-lg border border-gray-200 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Нет достижений</p>
              )}
            </section>
          </div>
        </div>
      )}
    </Dialog>
  )
}
