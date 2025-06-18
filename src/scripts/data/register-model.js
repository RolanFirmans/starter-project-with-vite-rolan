import { registerUser } from "./api";
 
const RegisterModel = {
  async register(name, email, password) {
    return await registerUser(name, email, password);
  },
};
 
export default RegisterModel;