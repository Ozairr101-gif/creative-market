const AUTH_ERROR_MESSAGES: Array<[matcher: RegExp, message: string]> = [
  [
    /email rate limit exceeded/i,
    'Too many email attempts just now. Please wait a few minutes before trying again.',
  ],
  [
    /invalid login credentials/i,
    'The email or password is incorrect. Please check your details and try again.',
  ],
  [
    /email not confirmed/i,
    'Please confirm your email address before signing in.',
  ],
  [
    /user already registered/i,
    'An account with this email already exists. Try signing in instead.',
  ],
]

export function getAuthErrorMessage(message?: string | null) {
  if (!message) {
    return 'Something went wrong. Please try again.'
  }

  const normalizedMessage = message.trim()

  for (const [matcher, friendlyMessage] of AUTH_ERROR_MESSAGES) {
    if (matcher.test(normalizedMessage)) {
      return friendlyMessage
    }
  }

  return normalizedMessage
}
