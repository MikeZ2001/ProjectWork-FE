import {User} from "@models/user";
import api from "../api";

class UserService {
    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await api.get('v1/user');
            return response.data as User;
        } catch (error) {
            console.error('Get current user error', error);
            return null;
        }
    }
}

export default new UserService();