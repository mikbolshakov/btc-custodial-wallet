import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1749887327060 implements MigrationInterface {
  name = 'CreateUserTable1749887327060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "address" character varying NOT NULL, "privateKey" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
