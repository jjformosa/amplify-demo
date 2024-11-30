import { RouterProvider } from 'react-router-dom';
import { LiffProvider } from './context/LiffContext';
import { AmplifyAuthProvider } from './context/amplify/AuthContext';
import { router } from './router';

function App() {

  return (
    <main>
      <LiffProvider liffId='2004822790-ndEy8LlX'>
        {/* <AmplifyAuthProvider> */}
          <RouterProvider router={router} />
        {/* </AmplifyAuthProvider> */}
      </LiffProvider>
    </main>
  );
}

export default App;
