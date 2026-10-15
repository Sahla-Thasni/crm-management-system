const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
}

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = true, headers: customHeaders, ...fetchOptions } = options;

  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers = new Headers(customHeaders);

  const isFormData =
    fetchOptions.body instanceof FormData;

  if (!isFormData) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (auth && accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...fetchOptions,
      headers,
    },
  );

  if (response.status === 401 && auth) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      window.location.href = "/login?sessionExpired=true";
    }

    throw new Error(
      "Session expired. Please login again.",
    );
  }

  // API errors
  if (!response.ok) {
    const errorData =
      await response.json().catch(() => null);

    let message =
      `Request failed (${response.status}).`;

    if (errorData?.detail) {
      message = errorData.detail;
    } else if (
      errorData &&
      typeof errorData === "object"
    ) {
      const firstError =
        Object.values(errorData)[0];

      if (Array.isArray(firstError)) {
        message = String(firstError[0]);
      } else if (
        typeof firstError === "string"
      ) {
        message = firstError;
      }
    }

    throw new Error(message);
  }

  // Successful request with no response body
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}