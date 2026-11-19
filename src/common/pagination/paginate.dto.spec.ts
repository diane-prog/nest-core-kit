import { PaginateDto } from './paginate.dto';

describe('PaginateDto', () => {
  it('should have default page 1 and limit 10', () => {
    const dto = new PaginateDto();
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.skip).toBe(0);
  });

  it('should calculate skip correctly for custom page and limit', () => {
    const dto = new PaginateDto();
    dto.page = 3;
    dto.limit = 20;
    expect(dto.skip).toBe(40);
  });
});
