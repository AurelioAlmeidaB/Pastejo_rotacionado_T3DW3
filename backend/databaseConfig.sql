CREATE TABLE IF NOT EXISTS pasto (
    pastoid BIGSERIAL CONSTRAINT pk_pasto PRIMARY KEY,
    descricao VARCHAR(60),
    areatotal NUMERIC(10,2),
    removido BOOLEAN DEFAULT false
);

INSERT INTO pasto VALUES
    (1, 'Pasto da Sede', 25.50),
    (2, 'Pasto do Córrego', 40.00)
    ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS piquete (
    piqueteid BIGSERIAL CONSTRAINT pk_piquete PRIMARY KEY,
    descricao VARCHAR(60),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    pastoidfk BIGINT CONSTRAINT fk_piquete_pasto REFERENCES pasto,
    removido BOOLEAN DEFAULT false
);

INSERT INTO piquete VALUES
    (1, 'Piquete 1', -20.4231000, -49.9781000, 1),
    (2, 'Piquete 2', -20.4239000, -49.9792000, 1),
    (3, 'Piquete A', -20.4301000, -49.9655000, 2),
    (4, 'Piquete B', -20.4310000, -49.9667000, 2)
    ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS animal (
    animalid BIGSERIAL CONSTRAINT pk_animal PRIMARY KEY,
    nome VARCHAR(60),
    datanasc DATE,
    removido BOOLEAN DEFAULT false
);

INSERT INTO animal VALUES
    (1, 'Mimosa', '2021-03-10'),
    (2, 'Estrela', '2020-08-22'),
    (3, 'Pintada', '2022-01-05'),
    (4, 'Boneca', '2019-11-30')
    ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS alocado (
    alocadoid BIGSERIAL CONSTRAINT pk_alocado PRIMARY KEY,
    animalidifk BIGINT CONSTRAINT fk_alocado_animal REFERENCES animal,
    piqueteidfk BIGINT CONSTRAINT fk_alocado_piquete REFERENCES piquete,
    datainicio DATE,
    datafinal DATE,
    removido BOOLEAN DEFAULT false
);

INSERT INTO alocado VALUES
    (1, 1, 1, '2026-10-01', '2026-10-15'),
    (2, 1, 2, '2026-10-16', NULL),
    (3, 2, 3, '2026-10-20', NULL)
    ON CONFLICT DO NOTHING;

SELECT setval('pasto_pastoid_seq', (SELECT COALESCE(MAX(pastoid), 1) FROM pasto));
SELECT setval('piquete_piqueteid_seq', (SELECT COALESCE(MAX(piqueteid), 1) FROM piquete));
SELECT setval('animal_animalid_seq', (SELECT COALESCE(MAX(animalid), 1) FROM animal));
SELECT setval('alocado_alocadoid_seq', (SELECT COALESCE(MAX(alocadoid), 1) FROM alocado));

CREATE TABLE IF NOT EXISTS usuarios (
    usuarioid BIGSERIAL CONSTRAINT pk_usuarios PRIMARY KEY,
    username VARCHAR(10) UNIQUE,
    password TEXT,
    removido BOOLEAN DEFAULT false
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios VALUES
    (DEFAULT, 'admin', crypt('admin', gen_salt('bf'))),
    (DEFAULT, 'qwe', crypt('qwe', gen_salt('bf')))
    ON CONFLICT DO NOTHING;
