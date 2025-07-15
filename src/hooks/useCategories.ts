import { useState, useEffect } from 'react';
import CategoryService from '../services/category/category.service';
import { Category } from '@models/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await CategoryService.getCategories();
        setCategories(res.data);
      } catch (e) {
        // handle error
      }
    }
    fetchCategories();
  }, []);

  return { categories };
} 