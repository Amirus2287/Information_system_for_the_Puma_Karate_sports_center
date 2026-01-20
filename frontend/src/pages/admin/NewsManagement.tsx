import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import { Plus, Edit, Trash2, Newspaper } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function NewsManagement() {
  const queryClient = useQueryClient()
  const [editingNews, setEditingNews] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  
  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => usersApi.getNews(),
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('Новость удалена')
    },
    onError: () => {
      toast.error('Ошибка при удалении новости')
    },
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление новостями</h1>
          <p className="text-gray-600 mt-1">Создание и редактирование новостей спортивного центра</p>
        </div>
        <Button onClick={() => { setEditingNews(null); setShowForm(true) }} leftIcon={<Plus />}>
          Создать новость
        </Button>
      </div>
      
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-elegant">
        {news?.length ? (
          <div className="space-y-4">
            {news.map((item: any) => (
              <div
                key={item.id}
                className="bg-gradient-to-r from-white to-red-50 border-2 border-gray-100 rounded-xl p-5 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Newspaper className="w-5 h-5 text-primary-600" />
                      <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                    </div>
                    <div 
                      className="text-sm text-gray-600 mb-3 line-clamp-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Автор: {item.author_name || 'Неизвестен'}</span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditingNews(item); setShowForm(true) }}
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm('Вы уверены, что хотите удалить эту новость?')) {
                          deleteMutation.mutate(item.id)
                        }
                      }}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Нет новостей</p>
            <p className="text-gray-400 text-sm mt-2">Создайте первую новость</p>
          </div>
        )}
      </div>
      
      {showForm && (
        <NewsForm
          news={editingNews}
          onClose={() => { setShowForm(false); setEditingNews(null) }}
        />
      )}
    </div>
  )
}

function NewsForm({ news, onClose }: { news: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(news?.title || '')
  const [content, setContent] = useState(news?.content || '')
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ]
  
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (news) {
        return usersApi.updateNews(news.id, data)
      }
      return usersApi.createNews(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success(news ? 'Новость обновлена' : 'Новость создана')
      onClose()
    },
    onError: () => {
      toast.error('Ошибка при сохранении новости')
    },
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ title, content })
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {news ? 'Редактировать новость' : 'Создать новость'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Содержание
            </label>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Введите текст новости..."
                style={{ minHeight: '300px' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Вы можете вставлять изображения, используя кнопку "Image" в панели инструментов
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {news ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
