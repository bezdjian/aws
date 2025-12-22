class TokenInfo:
    def __init__(
            self,
            iss: str,
            azp: str,
            aud: str,
            sub: str,
            hd: str,
            email: str,
            email_verified: bool,
            nbf: int,
            name: str,
            picture: str,
            given_name: str,
            family_name: str,
            iat: int,
            exp: int,
            jti: str,
            alg: str,
            kid: str,
            typ: str
    ):
        self._iss = iss
        self._azp = azp
        self._aud = aud
        self._sub = sub
        self._hd = hd
        self._email = email
        self._email_verified = email_verified
        self._nbf = nbf
        self._name = name
        self._picture = picture
        self._given_name = given_name
        self._family_name = family_name
        self._iat = iat
        self._exp = exp
        self._jti = jti
        self._alg = alg
        self._kid = kid
        self._typ = typ

    def iss(self) -> str:
        return self._iss

    def azp(self) -> str:
        return self._azp

    def aud(self) -> str:
        return self._aud

    def sub(self) -> str:
        return self._sub

    def hd(self) -> str:
        return self._hd

    def email(self) -> str:
        return self._email

    def email_verified(self) -> bool:
        return self._email_verified

    def nbf(self) -> int:
        return self._nbf

    def name(self) -> str:
        return self._name

    def picture(self) -> str:
        return self._picture

    def givenName(self) -> str:
        return self._given_name

    def family_name(self) -> str:
        return self._family_name

    def iat(self) -> int:
        return self._iat

    def exp(self) -> int:
        return self._exp

    def jti(self) -> str:
        return self._jti

    def alg(self) -> str:
        return self._alg

    def kid(self) -> str:
        return self._kid

    def typ(self) -> str:
        return self._typ
