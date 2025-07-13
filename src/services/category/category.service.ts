import {Category} from "@models/category";
import api from "../api";

class CategoryService {
    async getCategories(page: number = 1, per_page: number = 10): Promise<{ data: Category[]}> {
        try {
            const response = await api.get(`/v1/categories`);
            return {
                data: response.data,
            };
        } catch (error) {
            console.error(`Error fetching categories`, error);
            throw error;
        }
    }

    async createCategory(categoryId: number, categoryData: Partial<Category>): Promise<Category> {
        try {
            const response = await api.post<any>(`/v1/categories/${categoryId}/categories`, categoryData);
            return response.data;
        } catch (error) {
            console.error(`Error creating category ${categoryId}:`, error);
            throw error;
        }
    }

    async getCategoryById(categoryId: string): Promise<Category> {
        try {
            const response = await api.get<any>(`/v1/categories/${categoryId}`);

            return response.data;
        } catch (error) {
            console.error(`Error fetching category ${categoryId}:`, error);
            throw error;
        }
    }

    async deleteCategory(categoryId: number): Promise<any> {
        try {
            const response = await api.delete(`/v1/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting category ${categoryId}:`, error);
            throw error;
        }
    }

    async updateCategory(categoryId: number, categoryData: Partial<Category>): Promise<Category> {
        try {

            const response = await api.put<any>(`/v1/categories/${categoryId}`, categoryData);

            return response.data
        } catch (error) {
            console.error(`Error updating category ${categoryId}:`, error);
            throw error;
        }
    }

    async transferFunds(fromAccountId: number, toAccountId: number, amount: number, description?: string): Promise<any> {
        try {
            const apiData = {
                from_account_id: fromAccountId,
                to_account_id: toAccountId,
                amount: amount,
                description: description
            };

            const response = await api.post<any>('/v1/transfers', apiData);
            return response.data;
        } catch (error) {
            console.error('Error transferring funds:', error);
            throw error;
        }
    }
}

export default new CategoryService();