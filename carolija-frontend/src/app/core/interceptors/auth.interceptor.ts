import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  let authReq = req;

  if(token){
    const cloned = req.clone({
      setHeaders:{
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Sesija istekla, preusmjeravanje na login...');
      } else if (error.status === 500) {
        console.error('Server greška, pokušajte kasnije.');
      }
      
      return throwError(() => error);
    })
  );
};
