import React, { useCallback } from 'react';
import { uploadData } from 'aws-amplify/storage';

export type UploadFileInputParam = {
    directName: 'public' | 'personal' | 'private';
    uId: string;
} 

export const UploadFileInput = ({ directName } : UploadFileInputParam) => {
  const [file, setFile] = React.useState<File|null>(null);

  const handleChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const onUploadFileClick = useCallback(() => {
    if (!file) {
      return;
    }
    uploadData({
      path: () => `${directName}/1234/${file.name}`,
      data: file,
    })
  }, [file, directName])

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={onUploadFileClick}>
        Upload
      </button>
    </div>
  );
}