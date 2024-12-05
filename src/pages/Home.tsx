import { useCallback, useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useLiff } from "@src/hook/line/useLiff";
import { useAmplifyAuth } from "@src/hook/amplify";
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';

const client = generateClient<Schema>();
export const Home = () => {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const $navigate = useNavigate();
  const $liff = useLiff();
  const $amplifyAuth = useAmplifyAuth();

  // [Day9]
  const refreshTodo = useCallback(() => {
    client.models.Todo.sortByCreatedAt({  // you replace it to models.Todo.list method, and see what will happend after createTodo several times
      author: $amplifyAuth.userName!
    }).then(({ data, nextToken }) => {
      setTodos([...data])
      if (nextToken) {  // it would be very helpfully, if you want to work with Infinite Scroll.
        console.log('nextToken', nextToken)
      }
    })
    .catch((err) => console.error(err))
  }, [$amplifyAuth.userName])
  
  // [Day9]
  const createTodo = useCallback(() => {
    if (!$amplifyAuth.userId) throw new Error('not login');
    const id = v4();
    const now = new Date().toISOString();
    const author = $amplifyAuth.userId;
    const authorName = $amplifyAuth.userName;
    const content = window.prompt("Todo content");
    const done = false;
    client.models.Todo.create({
      id,
      createdAt: now,
      updatedAt: now,
      author,
      authorName,
      done,
      content,
    }).then(() => {
      refreshTodo()
     });
  }, [$amplifyAuth.userId])

  const _loginWithLiff = useCallback(async () => {
    if ($liff.isLoggedIn && !$amplifyAuth.isLoggedIn) {
      const accesstoken = $liff.accessToken!;
      const idToken = $liff.idToken!;
      await $amplifyAuth.doLogin('liff', { accesstoken, idToken })
    }
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
    // client.models.Todo.observeQuery().subscribe({
    //   next: (data) => setTodos([...data.items]),
    // });
    // [Day9] sample, but you can figure out that observe maybe the more useful method.
    if ($amplifyAuth.isLoggedIn) {
      refreshTodo()
    }
  }, [$amplifyAuth.isLoggedIn]);
  useEffect(() => {
    if(!$liff.inited) return
    if(!$liff.isLoggedIn) {
      $navigate('/login')
    } else {
      _loginWithLiff()
      // $liff.doLogout()
    }
  }, [$liff.inited, $liff.isLoggedIn])

  if ($amplifyAuth.isLoggedIn) {
    return (
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
    );
  } else {
    <div>TODO 載入中</div>
  }
};