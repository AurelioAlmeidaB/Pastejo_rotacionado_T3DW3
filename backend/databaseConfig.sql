-- arquivo: backend/databaseConfig.sql
-- Módulo agrícola: Pastejo Rotacionado
-- pasto 1:N piquete | animal N:N piquete (tabela alocado)

----- Cria o banco de dados (executar conectado ao banco postgres)
-- create database pastejo;

create table IF NOT EXISTS pasto (
    pastoid bigserial constraint pk_pasto PRIMARY KEY,
    descricao varchar(60),
    areatotal numeric(10,2),
    removido boolean DEFAULT false
);

insert into pasto values
    (1, 'Pasto da Sede', 25.50),
    (2, 'Pasto do Córrego', 40.00)
    ON CONFLICT DO NOTHING;

create table IF NOT EXISTS piquete (
    piqueteid bigserial constraint pk_piquete PRIMARY KEY,
    descricao varchar(60),
    latitude numeric(10,7),
    longitude numeric(10,7),
    pastoidfk bigint constraint fk_piquete_pasto REFERENCES pasto,
    removido boolean DEFAULT false
);

insert into piquete values
    (1, 'Piquete 1', -20.4231000, -49.9781000, 1),
    (2, 'Piquete 2', -20.4239000, -49.9792000, 1),
    (3, 'Piquete A', -20.4301000, -49.9655000, 2),
    (4, 'Piquete B', -20.4310000, -49.9667000, 2)
    ON CONFLICT DO NOTHING;

create table IF NOT EXISTS animal (
    animalid bigserial constraint pk_animal PRIMARY KEY,
    nome varchar(60),
    datanasc date,
    removido boolean DEFAULT false
);

insert into animal values
    (1, 'Mimosa', '2021-03-10'),
    (2, 'Estrela', '2020-08-22'),
    (3, 'Pintada', '2022-01-05'),
    (4, 'Boneca', '2019-11-30')
    ON CONFLICT DO NOTHING;

-- Tabela resultante do relacionamento N:N entre animal e piquete
create table IF NOT EXISTS alocado (
    alocadoid bigserial constraint pk_alocado PRIMARY KEY,
    animalidifk bigint constraint fk_alocado_animal REFERENCES animal,
    piqueteidfk bigint constraint fk_alocado_piquete REFERENCES piquete,
    datainicio date,
    datafinal date,
    removido boolean DEFAULT false
);

insert into alocado values
    (1, 1, 1, '2026-10-01', '2026-10-15'),
    (2, 1, 2, '2026-10-16', null),
    (3, 2, 3, '2026-10-20', null)
    ON CONFLICT DO NOTHING;

-- Ajusta as sequências após inserir IDs fixos
SELECT setval('pasto_pastoid_seq', (SELECT COALESCE(MAX(pastoid), 1) FROM pasto));
SELECT setval('piquete_piqueteid_seq', (SELECT COALESCE(MAX(piqueteid), 1) FROM piquete));
SELECT setval('animal_animalid_seq', (SELECT COALESCE(MAX(animalid), 1) FROM animal));
SELECT setval('alocado_alocadoid_seq', (SELECT COALESCE(MAX(alocadoid), 1) FROM alocado));

-- Tabela de login (obrigatória, não entra na contagem das tabelas)
create table IF NOT EXISTS usuarios (
    usuarioid bigserial constraint pk_usuarios PRIMARY KEY,
    username varchar(10) UNIQUE,
    password text,
    removido boolean DEFAULT false
);

CREATE EXTENSION if NOT EXISTS pgcrypto;

insert into usuarios values
    (default, 'admin', crypt('admin', gen_salt('bf'))), -- senha criptografada com bcrypt
    (default, 'qwe', crypt('qwe', gen_salt('bf'))) -- senha criptografada com bcrypt
    ON CONFLICT DO NOTHING;
