"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTransformInterceptor = exports.RawResponse = exports.BypassTransform = exports.BYPASS_TRANSFORM_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
exports.BYPASS_TRANSFORM_KEY = 'bypassTransform';
const BypassTransform = () => (0, common_1.SetMetadata)(exports.BYPASS_TRANSFORM_KEY, true);
exports.BypassTransform = BypassTransform;
exports.RawResponse = exports.BypassTransform;
let ResponseTransformInterceptor = class ResponseTransformInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        if (this.reflector) {
            const bypass = this.reflector.getAllAndOverride(exports.BYPASS_TRANSFORM_KEY, [context.getHandler(), context.getClass()]);
            if (bypass) {
                return next.handle();
            }
        }
        const response = context.switchToHttp().getResponse();
        return next.handle().pipe((0, operators_1.map)((data) => ({
            success: true,
            statusCode: response.statusCode,
            data,
            timestamp: new Date().toISOString(),
        })));
    }
};
exports.ResponseTransformInterceptor = ResponseTransformInterceptor;
exports.ResponseTransformInterceptor = ResponseTransformInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ResponseTransformInterceptor);
//# sourceMappingURL=response-transform.interceptor.js.map