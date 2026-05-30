import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // { role: 'teacher'|'student', ...data }

  const loginAsTeacher = (teacher) => setCurrentUser({ role: 'teacher', ...teacher });
  const loginAsStudent = (student) => setCurrentUser({ role: 'student', ...student });
  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{ currentUser, loginAsTeacher, loginAsStudent, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
