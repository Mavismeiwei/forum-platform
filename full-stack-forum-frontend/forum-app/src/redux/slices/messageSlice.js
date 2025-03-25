import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async action to send a message
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://127.0.0.1:5009/messages', {
        // Use Gateway
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const messageSlice = createSlice({
  name: 'messages',
  initialState: { loading: false, error: null, success: false },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(sendMessage.pending, state => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(sendMessage.fulfilled, state => {
        state.loading = false
        state.success = true
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export default messageSlice.reducer
