const { useState, useEffect } = React;

const API_URL = "https://taskflow-backendd.onrender.com/api";
let socket = null;

// ==================== LOGIN ====================
function LoginPage({ onLoginSuccess }) {
const [isLogin, setIsLogin] = useState(true);
const [formData, setFormData] = useState({ email: "", password: "", name: "" });
const [error, setError] = useState("");

const handleSubmit = async (e) => {
e.preventDefault();

```
const url = isLogin ? "/auth/login" : "/auth/register";

const res = await fetch(API_URL + url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});

const data = await res.json();

if (!res.ok) {
  setError(data.message);
  return;
}

localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
onLoginSuccess();
```

};

return ( <div className="auth-container"> <h2>{isLogin ? "Login" : "Register"}</h2>

```
  {error && <p style={{ color: "red" }}>{error}</p>}

  <form onSubmit={handleSubmit}>
    {!isLogin && (
      <input
        placeholder="Name"
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
    )}

    <input
      placeholder="Email"
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    />

    <input
      type="password"
      placeholder="Password"
      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    />

    <button type="submit">{isLogin ? "Login" : "Register"}</button>
  </form>

  <button onClick={() => setIsLogin(!isLogin)}>
    Switch to {isLogin ? "Register" : "Login"}
  </button>
</div>
```

);
}

// ==================== TASK BOARD ====================
function Board() {
const [tasks, setTasks] = useState([]);

useEffect(() => {
loadTasks();
}, []);

const loadTasks = async () => {
const res = await fetch(API_URL + "/tasks", {
headers: { Authorization: localStorage.getItem("token") },
});
const data = await res.json();
setTasks(data.tasks || []);
};

const addTask = async () => {
const title = prompt("Task title?");
if (!title) return;

```
const res = await fetch(API_URL + "/tasks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token"),
  },
  body: JSON.stringify({ title }),
});

const data = await res.json();
setTasks([...tasks, data.task]);
```

};

const deleteTask = async (id) => {
await fetch(API_URL + "/tasks/" + id, {
method: "DELETE",
headers: { Authorization: localStorage.getItem("token") },
});

```
setTasks(tasks.filter((t) => t._id !== id));
```

};

return ( <div> <h2>Tasks</h2> <button onClick={addTask}>Add Task</button>

```
  {tasks.map((t) => (
    <div key={t._id}>
      {t.title}
      <button onClick={() => deleteTask(t._id)}>Delete</button>
    </div>
  ))}
</div>
```

);
}

// ==================== MAIN APP ====================
function App() {
const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

if (!loggedIn) {
return <LoginPage onLoginSuccess={() => setLoggedIn(true)} />;
}

return ( <div>
<button
onClick={() => {
localStorage.clear();
setLoggedIn(false);
}}
>
Logout </button>

```
  <Board />
</div>
```

);
}

ReactDOM.render(<App />, document.getElementById("root"));
