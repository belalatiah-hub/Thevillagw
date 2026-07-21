import { Global, Module } from '@nestjs/common';
import { ScopeService } from './scope.service';

/** Global so any feature module can inject ScopeService without re-importing. */
@Global()
@Module({
  providers: [ScopeService],
  exports: [ScopeService],
})
export class ScopeModule {}
