import { HttpInterceptorFn } from '@angular/common/http';
import { LoadingService } from './loading.service';
import { finalize } from 'rxjs';
import { inject } from '@angular/core';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);
    loadingService.showLoading();

    return next(req).pipe(
        finalize(() => {
            loadingService.hideLoading();
        })
    );
};
