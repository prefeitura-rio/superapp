import { setFirstLoginFalse } from "@/actions/first-login"
import { getCitizenCpfFirstlogin } from "@/http/citizen/citizen"
import { getUserInfoFromToken } from "@/lib/user-info"
import Onboarding from "./components/on-boarding"

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  
  const userInfo = await getUserInfoFromToken();

  let firstLogin = false

  if (userInfo.cpf) {
    try {
      const response = await getCitizenCpfFirstlogin(userInfo.cpf)
      
      if (response.status === 200) {
        firstLogin = response.data?.firstlogin ?? false
      } else {
        console.error('Failed to fetch first login status:', response.data)
      }
    } catch (error) {
      console.error('Error fetching first login data:', error)
    }
  }

  if (firstLogin && userInfo.cpf) {
    return (
      <main className="flex max-w-md mx-auto flex-col bg-background text-foreground">
        <Onboarding userInfo={userInfo} setFirstLoginFalse={setFirstLoginFalse} />
      </main>
    )
  }
  
  return (
    <div>
      <main>{children}</main>
    </div>
  )
}
