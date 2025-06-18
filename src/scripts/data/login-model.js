import { loginUser } from "./api";
 
const LoginModel = {
  async login(email, password) {
    return await loginUser(email, password);
  },
};
 
export default LoginModel;