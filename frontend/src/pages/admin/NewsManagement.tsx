import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import { Plus, Edit, Trash2, Newspaper } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const FONT_OPTIONS = [
  { value: 'arial', label: 'Arial' },
  { value: 'times-new-roman', label: 'Times New Roman' },
  { value: 'calibri', label: 'Calibri' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'verdana', label: 'Verdana' },
  { value: 'courier-new', label: 'Courier New' },
  { value: 'comic-sans-ms', label: 'Comic Sans MS' },
  { value: 'impact', label: 'Impact' },
  { value: 'lucida-console', label: 'Lucida Console' },
  { value: 'tahoma', label: 'Tahoma' },
  { value: 'trebuchet-ms', label: 'Trebuchet MS' },
] as const

const FONT_VALUES = FONT_OPTIONS.map((f) => f.value)
const FONT_LABEL_BY_VALUE = Object.fromEntries(
  FONT_OPTIONS.map((f) => [f.value, f.label])
) as Record<string, string>

const SIZE_VALUES = [
  '8px',
  '9px',
  '10px',
  '11px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '36px',
  '48px',
  '72px',
] as const

const SIZE_LABEL_BY_VALUE = Object.fromEntries(
  SIZE_VALUES.map((v) => [v, v.replace('px', '')])
) as Record<string, string>

const quillAny = Quill as any
if (!quillAny.__pumaFormatsRegistered) {
  const Font = Quill.import('formats/font') as any
  Font.whitelist = [...FONT_VALUES]
  Quill.register(Font, true)

  const SizeStyle = Quill.import('attributors/style/size') as any
  SizeStyle.whitelist = [...SIZE_VALUES]
  Quill.register(SizeStyle, true)

  quillAny.__pumaFormatsRegistered = true
}

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
  const quillRef = useRef<any>(null)
  
  const modules = {
    toolbar: [
      [{ font: FONT_VALUES }],
      [{ size: [...SIZE_VALUES] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['image']
    ],
    clipboard: {
      matchVisual: false
    }
  }
  
  const formats = [
    'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'script',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'image'
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
      setTitle('')
      setContent('')
      onClose()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.title?.[0] || 
                          error.response?.data?.content?.[0] || 
                          error.response?.data?.detail || 
                          'Ошибка при сохранении новости'
      toast.error(errorMessage)
    },
  })
  
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor()
      const toolbar = quill.getModule('toolbar')
      
      const updatePickerLabels = () => {
        const fontPicker = toolbar.container.querySelector('.ql-font')
        const sizePicker = toolbar.container.querySelector('.ql-size')
        
        if (fontPicker) {
          const fontLabel = fontPicker.querySelector('.ql-picker-label')
          const selectedFont = quill.getFormat().font
          if (fontLabel) {
            let fontName = ''
            if (selectedFont && FONT_VALUES.includes(selectedFont)) {
              fontName = FONT_LABEL_BY_VALUE[selectedFont] || ''
            }
            fontLabel.setAttribute('data-label', fontName)
            fontLabel.textContent = ''
            const existingSpan = fontLabel.querySelector('span.ql-picker-label-text')
            if (existingSpan) {
              existingSpan.remove()
            }
            const allSpans = fontLabel.querySelectorAll('span')
            allSpans.forEach(span => {
              if (!span.classList.contains('ql-stroke') && !span.classList.contains('ql-fill')) {
                span.remove()
              }
            })
          }
        }
        
        if (sizePicker) {
          const sizeLabel = sizePicker.querySelector('.ql-picker-label')
          const selectedSize = quill.getFormat().size
          if (sizeLabel) {
            let sizeValue = ''
            if (selectedSize && SIZE_VALUES.includes(selectedSize)) {
              sizeValue = SIZE_LABEL_BY_VALUE[selectedSize] || ''
            }
            sizeLabel.setAttribute('data-label', sizeValue)
            sizeLabel.textContent = ''
            const existingSpan = sizeLabel.querySelector('span.ql-picker-label-text')
            if (existingSpan) {
              existingSpan.remove()
            }
            const allSpans = sizeLabel.querySelectorAll('span')
            allSpans.forEach(span => {
              if (!span.classList.contains('ql-stroke') && !span.classList.contains('ql-fill')) {
                span.remove()
              }
            })
          }
        }
      }
      
      const initPickers = () => {
        setTimeout(() => {
          updatePickerLabels()
          
          const fontPicker = toolbar.container.querySelector('.ql-font')
          const sizePicker = toolbar.container.querySelector('.ql-size')
          
          if (fontPicker) {
            const items = fontPicker.querySelectorAll('.ql-picker-item')
            items.forEach((item: any) => {
              item.addEventListener('click', () => {
                setTimeout(updatePickerLabels, 50)
              })
            })
          }
          
          if (sizePicker) {
            const items = sizePicker.querySelectorAll('.ql-picker-item')
            items.forEach((item: any) => {
              item.addEventListener('click', () => {
                setTimeout(updatePickerLabels, 50)
              })
            })
          }
        }, 200)
      }
      
      initPickers()
      
      quill.on('selection-change', updatePickerLabels)
      quill.on('text-change', updatePickerLabels)
      quill.on('editor-change', updatePickerLabels)
      
      return () => {
        quill.off('selection-change', updatePickerLabels)
        quill.off('text-change', updatePickerLabels)
        quill.off('editor-change', updatePickerLabels)
      }
    }
  }, [])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Введите заголовок новости')
      return
    }
    if (!content.trim() || content.trim() === '<p><br></p>') {
      toast.error('Введите содержание новости')
      return
    }
    mutation.mutate({ title: title.trim(), content })
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
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
              <style>{`
                .ql-container {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  font-size: 14px;
                  min-height: 400px;
                  background: white;
                }
                .ql-editor {
                  min-height: 400px;
                  padding: 20px;
                  line-height: 1.6;
                }
                .ql-toolbar {
                  background: #f8f9fa;
                  border-bottom: 1px solid #e0e0e0;
                  padding: 0 !important;
                  margin: 0 !important;
                  border-top-left-radius: 8px;
                  border-top-right-radius: 8px;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0;
                }
                .ql-toolbar > * {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .ql-toolbar .ql-formats {
                  margin: 0 !important;
                  padding: 0 !important;
                  display: flex;
                  align-items: center;
                  gap: 0;
                }
                .ql-toolbar .ql-picker {
                  height: 28px;
                  width: auto;
                  min-width: 100px;
                  margin: 0;
                  padding: 0;
                }
                .ql-toolbar .ql-picker-label {
                  width: 100%;
                  min-width: 100px;
                  height: 28px;
                  padding: 0 8px;
                  margin: 0;
                  border: 1px solid transparent;
                  border-radius: 3px;
                  color: #495057;
                  font-size: 11px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;
                  position: relative;
                  overflow: hidden;
                }
                .ql-toolbar .ql-picker-label svg {
                  width: 16px;
                  height: 16px;
                  flex-shrink: 0;
                  margin: 0;
                }
                .ql-toolbar .ql-picker-label:hover {
                  background: #e9ecef;
                  border-color: #dee2e6;
                }
                .ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
                  background: #e9ecef;
                  border-color: #dee2e6;
                }
                .ql-toolbar .ql-picker-options {
                  background: white;
                  border: 1px solid #dee2e6;
                  border-radius: 4px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                  padding: 4px 0;
                  margin-top: 4px;
                  max-height: 300px;
                  overflow-y: auto;
                }
                .ql-toolbar .ql-picker-item {
                  padding: 4px 12px;
                  font-size: 13px;
                  cursor: pointer;
                }
                .ql-toolbar .ql-picker-item:hover {
                  background: #f8f9fa;
                }
                .ql-toolbar .ql-picker-item.ql-selected {
                  background: #e7f3ff;
                  color: #0066cc;
                }
                .ql-toolbar .ql-stroke {
                  stroke: #495057;
                }
                .ql-toolbar .ql-fill {
                  fill: #495057;
                }
                .ql-toolbar button {
                  width: 28px;
                  height: 28px;
                  margin: 0;
                  padding: 4px;
                  border: 1px solid transparent;
                  border-radius: 3px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                }
                .ql-toolbar button svg {
                  width: 16px;
                  height: 16px;
                }
                .ql-toolbar button:hover,
                .ql-toolbar button.ql-active {
                  background: #e9ecef;
                  border-color: #dee2e6;
                }
                .ql-toolbar .ql-font .ql-picker-label {
                  position: relative;
                }
                .ql-toolbar .ql-font .ql-picker-label > span:not(.ql-stroke):not(.ql-fill) {
                  display: none !important;
                }
                .ql-toolbar .ql-font .ql-picker-label::before {
                  content: '' !important;
                }
                .ql-toolbar .ql-font .ql-picker-label svg {
                  display: block !important;
                  position: absolute;
                  right: 8px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 12px;
                  height: 12px;
                }
                .ql-toolbar .ql-font .ql-picker-label {
                  color: transparent !important;
                }
                .ql-toolbar .ql-font .ql-picker-label::after {
                  content: attr(data-label);
                  font-family: var(--ql-font-family, 'Segoe UI', sans-serif);
                  font-size: 11px;
                  line-height: 28px;
                  position: absolute;
                  top: 0;
                  left: 8px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  max-width: calc(100% - 32px);
                  color: #495057;
                }
                .ql-toolbar .ql-font .ql-picker-label:not([data-label])::after,
                .ql-toolbar .ql-font .ql-picker-label[data-label=""]::after {
                  content: 'A';
                  font-size: 12px;
                  font-weight: 600;
                }
                .ql-toolbar .ql-font .ql-picker-label[data-label="Arial"]::after {
                  font-family: Arial, sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-label[data-label="Times New Roman"]::after {
                  font-family: "Times New Roman", serif;
                }
                .ql-toolbar .ql-font .ql-picker-label[data-label="Calibri"]::after {
                  font-family: Calibri, sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-label[data-label="Georgia"]::after {
                  font-family: Georgia, serif;
                }
                .ql-toolbar .ql-font .ql-picker-label[data-label="Verdana"]::after {
                  font-family: Verdana, sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-label[data-label="Courier New"]::after {
                  font-family: "Courier New", monospace;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="arial"]::before {
                  content: 'Arial';
                  font-family: Arial, sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="times-new-roman"]::before {
                  content: 'Times New Roman';
                  font-family: "Times New Roman", serif;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="calibri"]::before {
                  content: 'Calibri';
                  font-family: Calibri, sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="georgia"]::before {
                  content: 'Georgia';
                  font-family: Georgia, serif;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="verdana"]::before {
                  content: 'Verdana';
                  font-family: Verdana, sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="courier-new"]::before {
                  content: 'Courier New';
                  font-family: "Courier New", monospace;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="comic-sans-ms"]::before {
                  content: 'Comic Sans MS';
                  font-family: "Comic Sans MS", sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="impact"]::before {
                  content: 'Impact';
                  font-family: Impact, sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="lucida-console"]::before {
                  content: 'Lucida Console';
                  font-family: "Lucida Console", monospace;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="tahoma"]::before {
                  content: 'Tahoma';
                  font-family: Tahoma, sans-serif;
                }
                .ql-toolbar .ql-font .ql-picker-item[data-value="trebuchet-ms"]::before {
                  content: 'Trebuchet MS';
                  font-family: "Trebuchet MS", sans-serif;
                }
                .ql-toolbar .ql-size .ql-picker-label {
                  position: relative;
                }
                .ql-toolbar .ql-size .ql-picker-label > span:not(.ql-stroke):not(.ql-fill) {
                  display: none !important;
                }
                .ql-toolbar .ql-size .ql-picker-label::before {
                  content: '' !important;
                }
                .ql-toolbar .ql-size .ql-picker-label svg {
                  display: block !important;
                  position: absolute;
                  right: 8px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 12px;
                  height: 12px;
                }
                .ql-toolbar .ql-size .ql-picker-label {
                  color: transparent !important;
                }
                .ql-toolbar .ql-size .ql-picker-label::after {
                  content: attr(data-label);
                  font-size: 11px;
                  font-weight: 600;
                  line-height: 28px;
                  position: absolute;
                  top: 0;
                  left: 8px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  max-width: calc(100% - 32px);
                  color: #495057;
                }
                .ql-toolbar .ql-size .ql-picker-label:not([data-label])::after,
                .ql-toolbar .ql-size .ql-picker-label[data-label=""]::after {
                  content: '12';
                  font-size: 11px;
                  font-weight: 600;
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="8px"]::before {
                  content: '8';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="9px"]::before {
                  content: '9';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="10px"]::before {
                  content: '10';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="11px"]::before {
                  content: '11';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="12px"]::before {
                  content: '12';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="14px"]::before {
                  content: '14';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="16px"]::before {
                  content: '16';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="18px"]::before {
                  content: '18';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="20px"]::before {
                  content: '20';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="24px"]::before {
                  content: '24';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="28px"]::before {
                  content: '28';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="36px"]::before {
                  content: '36';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="48px"]::before {
                  content: '48';
                }
                .ql-toolbar .ql-size .ql-picker-item[data-value="72px"]::before {
                  content: '72';
                }
                .ql-editor.ql-blank::before {
                  color: #999;
                  font-style: normal;
                }
                .ql-editor p,
                .ql-editor ol,
                .ql-editor ul {
                  margin-bottom: 12px;
                }
                .ql-editor h1,
                .ql-editor h2,
                .ql-editor h3,
                .ql-editor h4,
                .ql-editor h5,
                .ql-editor h6 {
                  margin-top: 16px;
                  margin-bottom: 12px;
                  font-weight: 600;
                }
                .ql-editor .ql-font-arial {
                  font-family: Arial, sans-serif !important;
                }
                .ql-editor .ql-font-times-new-roman {
                  font-family: "Times New Roman", serif !important;
                }
                .ql-editor .ql-font-calibri {
                  font-family: Calibri, sans-serif !important;
                }
                .ql-editor .ql-font-georgia {
                  font-family: Georgia, serif !important;
                }
                .ql-editor .ql-font-verdana {
                  font-family: Verdana, sans-serif !important;
                }
                .ql-editor .ql-font-courier-new {
                  font-family: "Courier New", monospace !important;
                }
                .ql-editor .ql-font-comic-sans-ms {
                  font-family: "Comic Sans MS", sans-serif !important;
                }
                .ql-editor .ql-font-impact {
                  font-family: Impact, sans-serif !important;
                }
                .ql-editor .ql-font-lucida-console {
                  font-family: "Lucida Console", monospace !important;
                }
                .ql-editor .ql-font-tahoma {
                  font-family: Tahoma, sans-serif !important;
                }
                .ql-editor .ql-font-trebuchet-ms {
                  font-family: "Trebuchet MS", sans-serif !important;
                }
                .ql-editor span[style*="font-family: Arial"] {
                  font-family: Arial, sans-serif !important;
                }
                .ql-editor span[style*="font-family: 'Times New Roman'"],
                .ql-editor span[style*='font-family: "Times New Roman"'] {
                  font-family: "Times New Roman", serif !important;
                }
                .ql-editor span[style*="font-family: Calibri"] {
                  font-family: Calibri, sans-serif !important;
                }
                .ql-editor span[style*="font-family: Georgia"] {
                  font-family: Georgia, serif !important;
                }
                .ql-editor span[style*="font-family: Verdana"] {
                  font-family: Verdana, sans-serif !important;
                }
                .ql-editor span[style*="font-family: 'Courier New'"],
                .ql-editor span[style*='font-family: "Courier New"'] {
                  font-family: "Courier New", monospace !important;
                }
                .ql-editor span[style*="font-family: 'Comic Sans MS'"],
                .ql-editor span[style*='font-family: "Comic Sans MS"'] {
                  font-family: "Comic Sans MS", sans-serif !important;
                }
                .ql-editor span[style*="font-family: Impact"] {
                  font-family: Impact, sans-serif !important;
                }
                .ql-editor span[style*="font-family: 'Lucida Console'"],
                .ql-editor span[style*='font-family: "Lucida Console"'] {
                  font-family: "Lucida Console", monospace !important;
                }
                .ql-editor span[style*="font-family: Tahoma"] {
                  font-family: Tahoma, sans-serif !important;
                }
                .ql-editor span[style*="font-family: 'Trebuchet MS'"],
                .ql-editor span[style*='font-family: "Trebuchet MS"'] {
                  font-family: "Trebuchet MS", sans-serif !important;
                }
                .ql-editor .ql-size-8 {
                  font-size: 8px !important;
                }
                .ql-editor .ql-size-9 {
                  font-size: 9px !important;
                }
                .ql-editor .ql-size-10 {
                  font-size: 10px !important;
                }
                .ql-editor .ql-size-11 {
                  font-size: 11px !important;
                }
                .ql-editor .ql-size-12 {
                  font-size: 12px !important;
                }
                .ql-editor .ql-size-14 {
                  font-size: 14px !important;
                }
                .ql-editor .ql-size-16 {
                  font-size: 16px !important;
                }
                .ql-editor .ql-size-18 {
                  font-size: 18px !important;
                }
                .ql-editor .ql-size-20 {
                  font-size: 20px !important;
                }
                .ql-editor .ql-size-24 {
                  font-size: 24px !important;
                }
                .ql-editor .ql-size-28 {
                  font-size: 28px !important;
                }
                .ql-editor .ql-size-36 {
                  font-size: 36px !important;
                }
                .ql-editor .ql-size-48 {
                  font-size: 48px !important;
                }
                .ql-editor .ql-size-72 {
                  font-size: 72px !important;
                }
                .ql-editor span[style*="font-size: 8px"] {
                  font-size: 8px !important;
                }
                .ql-editor span[style*="font-size: 9px"] {
                  font-size: 9px !important;
                }
                .ql-editor span[style*="font-size: 10px"] {
                  font-size: 10px !important;
                }
                .ql-editor span[style*="font-size: 11px"] {
                  font-size: 11px !important;
                }
                .ql-editor span[style*="font-size: 12px"] {
                  font-size: 12px !important;
                }
                .ql-editor span[style*="font-size: 14px"] {
                  font-size: 14px !important;
                }
                .ql-editor span[style*="font-size: 16px"] {
                  font-size: 16px !important;
                }
                .ql-editor span[style*="font-size: 18px"] {
                  font-size: 18px !important;
                }
                .ql-editor span[style*="font-size: 20px"] {
                  font-size: 20px !important;
                }
                .ql-editor span[style*="font-size: 24px"] {
                  font-size: 24px !important;
                }
                .ql-editor span[style*="font-size: 28px"] {
                  font-size: 28px !important;
                }
                .ql-editor span[style*="font-size: 36px"] {
                  font-size: 36px !important;
                }
                .ql-editor span[style*="font-size: 48px"] {
                  font-size: 48px !important;
                }
                .ql-editor span[style*="font-size: 72px"] {
                  font-size: 72px !important;
                }
                .ql-editor img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 4px;
                  margin: 12px 0;
                }
                .ql-editor a {
                  color: #dc2626;
                  text-decoration: underline;
                }
                .ql-editor a:hover {
                  color: #b91c1c;
                }
              `}</style>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Начните вводить текст новости..."
                style={{ minHeight: '400px' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Используйте панель инструментов для форматирования текста, вставки изображений и видео
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
