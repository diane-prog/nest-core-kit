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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.ForbiddenException("You're not authorized to perform this action");
        }
        const normalizedRequiredRoles = requiredRoles.map((r) => r.toLowerCase());
        const userRoles = [];
        if (user.role?.label && typeof user.role.label === 'string') {
            const label = user.role.label.trim();
            if (label)
                userRoles.push(label.toLowerCase());
        }
        else if (typeof user.role === 'string') {
            const role = user.role.trim();
            if (role)
                userRoles.push(role.toLowerCase());
        }
        if (Array.isArray(user.roles)) {
            for (const r of user.roles) {
                if (typeof r === 'string' && r.trim()) {
                    userRoles.push(r.trim().toLowerCase());
                }
                else if (r?.label && typeof r.label === 'string' && r.label.trim()) {
                    userRoles.push(r.label.trim().toLowerCase());
                }
            }
        }
        const hasMatchingRole = userRoles.some((role) => normalizedRequiredRoles.includes(role));
        if (!hasMatchingRole) {
            throw new common_1.ForbiddenException("You're not authorized to perform this action");
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map