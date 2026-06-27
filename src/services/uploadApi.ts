import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const uploadApi= createApi({
    reducerPath: "uploadApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_FAKEAPI_BASE_URL}`,
    }),
     endpoints: (builder) => ({
    uploadFile: builder.mutation<{ location: string }, FormData>({
      query: (formData) => ({
        url: "/files/upload",
        method: "POST",
        body: formData,
      }),
    }),
})
});

export const {useUploadFileMutation} = uploadApi;