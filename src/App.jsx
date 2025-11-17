import React, {useState, useEffect, useRef} from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function App(){
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {role: 'system', content: 'You are a helpful assistant.'}
  ])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages])

  const send = async (e) => {
    e?.preventDefault()
    if(!input.trim()) return
    const userMsg = {role: 'user', content: input}
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ messages: newMessages })
      })
      if(!res.ok){
        const t = await res.text()
        throw new Error(t)
      }
      const data = await res.json()
      // the assistant reply from OpenAI chat completion
      const assistant = data.choices?.[0]?.message
      if(assistant){
        setMessages(prev => [...prev, assistant])
      } else if (data.error){
        setMessages(prev => [...prev, {role:'assistant', content: 'Error: ' + JSON.stringify(data.error).slice(0,300)}])
      } else {
        setMessages(prev => [...prev, {role:'assistant', content: 'No reply received.'}])
      }
    }catch(err){
      console.error(err)
      setMessages(prev => [...prev, {role:'assistant', content: 'Error: ' + err.message}])
    }finally{
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="chat">
        <div className="messages">
          {messages.filter(m=>m.role!=='system').map((m, i)=>(
            <div key={i} className={`msg ${m.role}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="composer">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Say something to the AI..." />
          <button type="submit" disabled={isLoading}>{isLoading ? '...' : 'Send'}</button>
        </form>
      </div>
    </div>
  )
}
