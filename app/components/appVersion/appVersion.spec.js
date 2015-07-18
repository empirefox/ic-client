// Default imports test
import version from './appVersion';

describe("appVersion", function() {

    it('should get version', function() {
        expect(new AppVersion().electronVersion).toBe('0.30.0');
    });

});
