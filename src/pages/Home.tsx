import { useCallback, useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useLiff } from "@src/hook/line/useLiff";
import { useAmplifyAuth } from "@src/hook/amplify";
import { useNavigate } from 'react-router-dom';

const client = generateClient<Schema>();
export const Home = () => {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const $navigate = useNavigate();
  const $liff = useLiff();
  const $amplifyAuth = useAmplifyAuth();

  const _loginWithLiff = useCallback(async () => {
    const accesstoken = await $liff.doGetAccessToken()
    const idToken = await $liff.getIdToken()
    if(!idToken || !accesstoken) return
    await $amplifyAuth.doLogin('liff', { accesstoken, idToken })
  }, [$liff.isLoggedIn])

  useEffect(() => {
    if(!$amplifyAuth.accessToken) return
    const profile = $amplifyAuth.getProfile()
    if (!profile) {
      console.error('aws login fail')
    } else {
      console.log('aws login success')
    }
  }, [$amplifyAuth.accessToken])

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);
  useEffect(() => {
    if(!$liff.inited) return
    console.log('aaa')
    if(!$liff.isLoggedIn) {
      $navigate('/login')
    } else {
      _loginWithLiff()
      // $liff.doLogout()
    }
  }, [$liff.inited, $liff.isLoggedIn])

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  if (!$liff.isLoggedIn) {
    return (
      <div>TODO 載入中</div>
    );
  } else {
    <>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </>
  }
};