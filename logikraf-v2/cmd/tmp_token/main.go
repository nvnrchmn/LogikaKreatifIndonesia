package main
import ("fmt";"os";"time";"github.com/golang-jwt/jwt/v5")
func main(){
t:=jwt.NewWithClaims(jwt.SigningMethodHS256,jwt.MapClaims{"sub":"1","role":"admin","exp":time.Now().Add(30*time.Minute).Unix()})
s,_:=t.SignedString([]byte(os.Getenv("SEC")))
fmt.Println(s)}
