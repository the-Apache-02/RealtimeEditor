import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import { EditorPage } from './pages/EditorPage';

const router=createBrowserRouter([
  {
    path:"/",
    element:<Home/>
  },
  {
    path:"/editor/:roomId",
    element:<EditorPage/>
  }
])
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
  
  <RouterProvider router={router}>
    <App />
  </RouterProvider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
