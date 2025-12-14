'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryForm } from '@/components/admin/category/CategoryForm'
import { CategoryList } from '@/components/admin/category/CategoryList'
import { Category, CategoryFormData } from '@/types/category-type'
import { useToast } from '@/hooks/use-toast'

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined,
  )
  const { toast } = useToast()

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return

    try {
      setCategories((prevCategories) => {
        // remove cate from list child of parent category
        let updatedCategories = removeFromCurrentParent(
          prevCategories,
          editingCategory,
        )

        // update info like name or slug or new parent
        const updatedCategory = {
          ...editingCategory,
          name: data.name,
          slug: data.slug,
          parent: data.parentId
            ? findCategoryById(updatedCategories, data.parentId)
            : undefined,
        }

        // add to new that parent choose (if no change parent so it will add again to old parent because removed from child of parent before)

        if (data.parentId && data.parentId !== -999) {
          console.log('updatedCategories', data.parentId)
          updatedCategories = addToNewParent(
            updatedCategories,
            updatedCategory,
            data.parentId,
          )
        } else {
          // default no parent choose, so it will add to top category (level default first)
          updatedCategories.push(updatedCategory)
        }

        return updatedCategories
      })

      toast({
        title: 'Cập nhập danh mục thành công',
        description: `Danh mục "${data.name}" đã được cập nhập.`,
        className: 'bg-green-500 text-white',
      })

      setEditingCategory(undefined)
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhập danh mục.',
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      })
    }
  }

  const findCategoryById = (
    categories: Category[],
    id: number,
  ): Category | undefined => {
    for (const category of categories) {
      if (category.id === id) return category
      if (category.children) {
        const found = findCategoryById(category.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  const removeFromCurrentParent = (
    categories: Category[],
    categoryToRemove: Category,
  ): Category[] => {
    return categories
      .map((cat) => ({
        ...cat,
        children: cat.children
          ? removeFromCurrentParent(cat.children, categoryToRemove).filter(
              (child) => child.id !== categoryToRemove.id,
            )
          : [],
      }))
      .filter((cat) => cat.id !== categoryToRemove.id)
  }

  const addToNewParent = (
    categories: Category[],
    categoryToAdd: Category,
    parentId: number,
  ): Category[] => {
    return categories.map((cat) => {
      if (cat.id === parentId) {
        return {
          ...cat,
          children: [...(cat.children || []), categoryToAdd],
        }
      }

      if (cat.children) {
        return {
          ...cat,
          children: addToNewParent(cat.children, categoryToAdd, parentId),
        }
      }

      return cat
    })
  }

  // Create a new category
  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      const newCategory: Category = {
        id: Date.now(), // You can still use this, but UUID is better
        name: data.name,
        slug: data.slug,
        parent: undefined,
        children: [],
      }

      setCategories((prevCategories) => {
        // Deep clone categories to avoid state mutation
        const updatedCategories = JSON.parse(JSON.stringify(prevCategories))
        let categoryAdded = false // Track if the category was added

        // Recursive function to find and add category in correct position
        const findAndAddCategory = (categories: Category[]): Category[] => {
          return categories.map((cat) => {
            if (cat.id === data.parentId) {
              categoryAdded = true // Mark as added
              return {
                ...cat,
                children: [
                  ...(cat.children || []),
                  { ...newCategory, parent: cat },
                ],
              }
            }

            if (cat.children && cat.children.length > 0) {
              return { ...cat, children: findAndAddCategory(cat.children) }
            }

            return cat
          })
        }

        const categoriesWithNewChild = findAndAddCategory(updatedCategories)

        // Only add as top-leve if it was NOT added inside any child
        if (!categoryAdded) {
          return [...categoriesWithNewChild, newCategory]
        }

        return categoriesWithNewChild
      })

      toast({
        title: 'Đã tạo danh mục mới',
        description: `Danh mục "${data.name}" đã được tạo thành công.`,
        className: 'bg-green-500 text-white',
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo mới danh mục.',
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      })
    }
  }

  const handleDeleteCategory = (categoryId: number) => {
    try {
      setCategories((prevCategories) => {
        // Recursive function to remove category and its children
        const removeCategory = (cats: Category[]): Category[] => {
          return cats
            .filter((cat) => cat.id !== categoryId)
            .map((cat) => ({
              ...cat,
              children: cat.children ? removeCategory(cat.children) : [],
            }))
        }

        // Also remove from parent's children
        const updatedCategories = removeCategory(prevCategories).map((cat) => ({
          ...cat,
          children:
            cat.children?.filter((child) => child.id !== categoryId) || [],
        }))

        return updatedCategories
      })

      toast({
        title: 'Danh mục đã được xóa',
        description: `Đã xóa thành công danh mục.`,
        className: 'bg-green-500 text-white',
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa danh mục.',
        className: 'bg-red-500 text-white',
        variant: 'destructive',
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(undefined)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              categories={categories}
              onSubmit={
                editingCategory ? handleUpdateCategory : handleCreateCategory
              }
              initialData={editingCategory}
              onCancel={handleCancelEdit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sơ đồ danh mục</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[50vh]">
            <CategoryList
              numberEdit={editingCategory?.id ?? undefined}
              categories={categories}
              onEdit={setEditingCategory}
              onDelete={handleDeleteCategory}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
