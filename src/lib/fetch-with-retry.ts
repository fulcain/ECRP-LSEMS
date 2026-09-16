/**
 * fetchWithRetry - wraps fetch() with automatic retries for transient
 * network/DNS failures (getaddrinfo EAI_AGAIN, socket hang-up, etc.).
 *
 * Google's published Sheets/Docs CSV URLs respond with a 30x redirect to a
 * *.googleusercontent.com host. Local DNS resolution for that host can fail
 * intermittently with EAI_AGAIN ("temporary failure, try again"), and the
 * native fetch() gives up immediately on a single try. We retry a few times
 * with backoff so a momentary DNS hiccup doesn't 500 the whole request.
 */
export async function fetchWithRetry(
  input: string | URL | globalThis.Request,
  init: RequestInit & { redirect?: RequestRedirect } = {},
  options: { retries?: number; baseDelayMs?: number } = {},
): Promise<Response> {
  const retries = options.retries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(input, {
        ...init,
        redirect: init.redirect ?? "follow",
      });
      return res;
    } catch (err) {
      lastError = err;

      // Check both err.code and err.cause?.code - different Node.js
      // / Next.js runtimes structure fetch errors differently (some
      // put the code directly on the error, others nest it under
      // cause). The known transient codes are DNS / connection
      // errors that warrant a retry.
      const errAny = err as { code?: string; cause?: { code?: string } };
      const code: string | undefined = errAny.code ?? errAny.cause?.code;
      const isTransient =
        code === "EAI_AGAIN" ||
        code === "ENOTFOUND" ||
        code === "ECONNRESET" ||
        code === "ETIMEDOUT" ||
        code === "ECONNREFUSED";

      console.warn(
        `[fetchWithRetry] attempt ${attempt + 1}/${retries + 1} failed`,
        `(${code ?? "unknown"}):`,
        err,
      );

      if (!isTransient || attempt === retries) break;

      const delay = baseDelayMs * 2 ** attempt; // 500ms, 1s, 2s, ...
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
