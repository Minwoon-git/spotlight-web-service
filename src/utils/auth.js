// Google 계정은 이미 검증된 이메일이므로 별도 인증이 필요 없다.
export const isEmailVerified = (user) =>
  !!user && (user.emailVerified || user.providerData?.some(p => p.providerId === 'google.com'))
