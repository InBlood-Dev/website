import { API_BASE_URL, API_TIMEOUT, HTTP_STATUS } from "./endpoints";

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;
let isLoggingOut = false;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
  if (token) isLoggingOut = false;
};

export const getAuthToken = (): string | null => authToken;

export const setOnUnauthorized = (callback: () => void): void => {
  onUnauthorized = callback;
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const buildHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

const buildMultipartHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

async function refreshTokens(): Promise<{
  status: "success" | "auth_failed" | "transient_error";
  token?: string;
}> {
  try {
    const refreshToken = localStorage.getItem("inblood_refresh_token");
    if (!refreshToken) return { status: "auth_failed" };

    const response = await fetch(
      `${API_BASE_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { status: "auth_failed" };
      }
      return { status: "transient_error" };
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;

    if (!newAccessToken) return { status: "transient_error" };

    localStorage.setItem("inblood_access_token", newAccessToken);
    if (newRefreshToken) {
      localStorage.setItem("inblood_refresh_token", newRefreshToken);
    }

    return { status: "success", token: newAccessToken };
  } catch {
    return { status: "transient_error" };
  }
}

const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  const headers = options.headers || buildHeaders();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === HTTP_STATUS.UNAUTHORIZED && !isLoggingOut) {
        const result = await refreshTokens();

        if (result.status === "success" && result.token) {
          authToken = result.token;

          const retryHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${result.token}`,
          };

          const retryOptions: RequestInit = { ...options, signal: undefined };
          if (options.body instanceof FormData) {
            delete retryHeaders["Content-Type"];
            retryOptions.headers = {
              Authorization: `Bearer ${result.token}`,
            };
          } else {
            retryOptions.headers = retryHeaders;
          }

          const retryController = new AbortController();
          const retryTimeout = setTimeout(
            () => retryController.abort(),
            API_TIMEOUT
          );

          try {
            const retryResponse = await fetch(url, {
              ...retryOptions,
              signal: retryController.signal,
            });
            clearTimeout(retryTimeout);
            const retryData = await retryResponse.json().catch(() => ({}));

            if (!retryResponse.ok) {
              if (retryResponse.status === HTTP_STATUS.UNAUTHORIZED) {
                isLoggingOut = true;
                onUnauthorized?.();
              }
              throw new ApiError(
                retryResponse.status,
                retryData.message || "An error occurred",
                retryData.errors
              );
            }
            return retryData as ApiResponse<T>;
          } catch (retryError) {
            clearTimeout(retryTimeout);
            throw retryError;
          }
        } else if (result.status === "auth_failed") {
          isLoggingOut = true;
          onUnauthorized?.();
        }
      }

      throw new ApiError(
        response.status,
        data.message || "An error occurred",
        data.errors
      );
    }

    return data as ApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError(0, "Request timed out");
      }
      throw new ApiError(0, error.message);
    }
    throw new ApiError(0, "An unexpected error occurred");
  }
};

export const get = async <T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<ApiResponse<T>> => {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }
  return request<T>(url, { method: "GET" });
};

export const post = async <T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const put = async <T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const del = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, { method: "DELETE" });
};

export const postFormData = async <T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "POST",
    headers: buildMultipartHeaders(),
    body: formData,
  });
};

export const putFormData = async <T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "PUT",
    headers: buildMultipartHeaders(),
    body: formData,
  });
};

const api = { get, post, put, del, postFormData, putFormData, setAuthToken, setOnUnauthorized };
export default api;
