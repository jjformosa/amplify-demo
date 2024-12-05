import React, { ChangeEvent, useCallback } from 'react';
import { uploadData } from 'aws-amplify/storage';

export type UploadFileInputParam = {
    directName: 'public' | 'personal' | 'private';
} 

export const UploadFileInput = ({ directName } : UploadFileInputParam) => {
  const [file, setFile] = React.useState<File|null>(null);

  const handleChange = (event: ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    if (!target.files) {
      return;
    }
    setFile(target.files[0]);
  };

  const onUploadFileClick = useCallback(() => {
    if (!file) {
      return;
    }
    uploadData({
      path: ({ identityId }) => `${directName}/${identityId}/${file.name}`,
      options: {
        bucket: 'secondBucket'
      },
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