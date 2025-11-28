import api from './api';

//Регистрация
export const register = async ({
  firstName,
  lastName, // фамилия
  middleName, // отчество
  role,
  email,
  password,
  groupNumber // только для студентов
}) => {
  const payload = {
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName,
    role,
    email,
    password
  };

  // добавляем group_number только если роль — студент
  if (role === 'student' && groupNumber) {
    payload.group_number = groupNumber;
  }

  const response = await api.post('/auth/register', payload);
  return response.data;
};

//Авторизация (вход)
export const login = async ({ email, password, role }) => {
  const response = await api.post('/auth/login', {
    email,
    password,
    role
  });
  return response.data; 
};