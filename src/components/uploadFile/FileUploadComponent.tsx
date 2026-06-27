"use client";

import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Controller, useFormContext } from "react-hook-form";

export function FileUploadDemo() {
  // const [files, setFiles] = React.useState<File[]>([]);
  // const [uploadMutiFiles] = useUploadFileMutation();
  const { control } = useFormContext();

  // const onUpload = React.useCallback(
  //     async (
  //       files: File[],
  //       {
  //         onProgress,
  //         onSuccess,
  //         onError,
  //       }: {
  //         onProgress: (file: File, progress: number) => void;
  //         onSuccess: (file: File) => void;
  //         onError: (file: File, error: Error) => void;
  //       },
  //     ) => {
  //       try {
  //         // Process each file individually

  //         const uploadPromises = files.map(async (file) => {
  //           try {
  //             // Simulate file upload with progress
  //              await uploadMutiFiles(file);

  //             const totalChunks = 10;
  //             let uploadedChunks = 0;

  //             // Simulate chunk upload with delays
  //             for (let i = 0; i < totalChunks; i++) {
  //               // Simulate network delay (100-300ms per chunk)
  //               await new Promise((resolve) =>
  //                 setTimeout(resolve, Math.random() * 200 + 100),
  //               );

  //               // Update progress for this specific file
  //               uploadedChunks++;
  //               const progress = (uploadedChunks / totalChunks) * 100;
  //               onProgress(file, progress);
  //             }

  //             // Simulate server processing delay
  //             await new Promise((resolve) => setTimeout(resolve, 500));
  //             onSuccess(file);
  //           } catch (error) {
  //             onError(
  //               file,
  //               error instanceof Error ? error : new Error("Upload failed"),
  //             );
  //           }
  //         });

  //         // Wait for all uploads to complete
  //         const multiFiles = await Promise.all(uploadPromises);
  //         console.log(multiFiles);

  //       } catch (error) {
  //         // This handles any error that might occur outside the individual upload processes
  //         console.error("Unexpected error during upload:", error);
  //       }
  //     },
  //     [],
  //   );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  return (
    <Controller
      control={control}
      name="thumbnail"
      render={({ field: { value, onChange } }) => {
        const fileArray = Array.isArray(value) ? value : [];
        return (
          <FileUpload
            maxFiles={1}
            maxSize={5 * 1024 * 1024}
            className="w-full max-w-md"
            value={fileArray}
            onValueChange={onChange}
            onFileReject={onFileReject}
            multiple
          >
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">Drag & drop files here</p>
                <p className="text-muted-foreground text-xs">
                  Or click to browse (max 2 files, up to 5MB each)
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button type="button" variant="outline" size="xs" className="mt-2 w-fit">
                  Choose files
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {fileArray.map((file, index) => (
                <FileUploadItem key={index} value={file} className="p-0">
                  <FileUploadItemPreview className="size-12 object-cover rounded" />
                  <FileUploadItemMetadata className="text-xs" />
                  <FileUploadItemDelete asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-7">
                      <X className="size-3"/>
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
        );
      }}
    />
  );
}
