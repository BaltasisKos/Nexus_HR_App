// // src/components/Login.tsx
// import React, { useState } from 'react';
// import { UserData } from '../types';
// import '../assets/css/Login.css';

// interface LoginProps {
//     onLogin: (data: UserData) => void;
// }

// const Login: React.FC<LoginProps> = ({ onLogin }) => {
//     const [formData, setFormData] = useState<UserData>({
//         username: '',
//         age: 25,
//         gender: 'Other'
//     });

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (formData.username.trim() && formData.age > 0) {
//             onLogin(formData);
//         }
//     };

//     return (
//         <div className="login-container">
//             <div className="login-card">
//                 <h2 className="login-title">Λίγα στοιχεία για εσάς</h2>
//                 <p className="login-subtitle">Βοηθήστε μας να προσαρμόσουμε την εμπειρία σας.</p>
                
//                 <form onSubmit={handleSubmit} className="login-form">
//                     <div className="input-group">
//                         <label>Ονοματεπώνυμο</label>
//                         <input 
//                             type="text" 
//                             required
//                             placeholder="π.χ. Γιάννης Παπαδόπουλος"
//                             value={formData.username}
//                             onChange={(e) => setFormData({...formData, username: e.target.value})}
//                         />
//                     </div>

//                     <div className="input-row">
//                         <div className="input-group">
//                             <label>Ηλικία</label>
//                             <input 
//                                 type="number" 
//                                 min="10" max="99"
//                                 value={formData.age}
//                                 onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
//                             />
//                         </div>

//                         <div className="input-group">
//                             <label>Φύλο</label>
//                             <select 
//                                 value={formData.gender}
//                                 onChange={(e) => setFormData({...formData, gender: e.target.value})}
//                             >
//                                 <option value="Male">Άνδρας</option>
//                                 <option value="Female">Γυναίκα</option>
//                                 <option value="Other">Άλλο</option>
//                             </select>
//                         </div>
//                     </div>

//                     <button type="submit" className="login-button">
//                         Συνέχεια στο Τεστ
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Login;