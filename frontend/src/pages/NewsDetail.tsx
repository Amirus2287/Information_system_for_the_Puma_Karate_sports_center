import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import { NewsForm } from './admin/NewsManagement'
import { ArrowLeft, Newspaper, Pencil, Calendar } from 'lucide-react'

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = user?.is_staff
  const [showForm, setShowForm] = useState(false)

  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news', id],
    queryFn: () => usersApi.getNewsById(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Новость не найдена</p>
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Link
            to="/dashboard"
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shrink-0"
            title="Назад на главную"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{news.title}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Новость спортивного центра</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {isAdmin && (
            <Button
              variant="outline"
              leftIcon={<Pencil className="w-4 h-4" />}
              onClick={() => setShowForm(true)}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Редактировать</span>
              <span className="sm:hidden">Изменить</span>
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <NewsForm
          news={news}
          onClose={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['news', id] })
          }}
        />
      )}

      <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-elegant w-full overflow-x-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Дата публикации</p>
              <p className="font-medium">
                {new Date(news.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Newspaper className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Автор</p>
              <p className="font-medium">{news.author_name || 'Неизвестен'}</p>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Содержание</h2>
          <div
            className="whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </div>
    </div>
  )
}
