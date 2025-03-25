
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import messageReducer from './slices/messageSlice'
import postsReducer from './slices/postSlice';
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    posts: postsReducer,
    user: userReducer,

  }
})

export default store
