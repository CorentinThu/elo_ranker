"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '3000', 10);
    await app.listen(port);
    // eslint-disable-next-line no-console
    console.log(`Realtime Elo Ranker server listening on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map