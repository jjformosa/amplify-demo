import React from 'react';
import { list, type ListAllWithPathOutput, type ListAllWithPathInput } from 'aws-amplify/storage';
import { type UploadFileInputParam } from './UploadFileInput';

export const FileList = ({ directName }: UploadFileInputParam) => {
  const [files, setFiles] = React.useState<any[]>([]);

  React.useEffect(() => {
    const input: ListAllWithPathInput = {
      path: ({ identityId }) => {
        const path = `${directName}/${identityId}`;
        console.log(path);
        return path;
      }
    };
    list(input).then((result: ListAllWithPathOutput) => {
      setFiles(result.items);
    });
  }, [directName]);

  return (
    <div>
      <h3>FileList</h3>
      <ul>
        {files.map((file) => (
          <li key={file.path}>{file.path}</li>
        ))}
      </ul>
    </div>
  )
}