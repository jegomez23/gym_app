> ⚠️ **STALE**: Storage is not implemented in the current MVP. This document describes a planned future feature. See `knowledge/DATABASE.md` for the current data contract.

# 06 — Storage

> **Propósito de este documento:** Definir los buckets de almacenamiento en Supabase Storage para Gym Circle. Qué archivos se almacenan, con qué permisos, tamaños máximos y nomenclatura.

---

## Buckets

| Bucket     | Propósito                  | Visibilidad                    | Tamaño máximo | Tipos MIME     |
| ---------- | -------------------------- | ------------------------------ | ------------- | -------------- |
| `avatars`  | Fotos de perfil de usuario | Público (lectura)              | 5MB           | jpg, png, webp |
| `evidence` | Fotos asociadas a Commits  | Privado (propietario + Circle) | 20MB          | jpg, png, webp |

### Bucket: avatars

**Propósito:** Almacenar las fotos de perfil de los usuarios.

**Visibilidad:**

- Lectura: pública (cualquiera puede ver un avatar por URL)
- Escritura: solo el propietario del perfil
- Eliminación: solo el propietario

**Nomenclatura:**

```
avatars/{user_id}.{ext}
```

Ejemplo: `avatars/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`

**Políticas RLS:**

```sql
-- INSERT: solo el propietario puede subir su avatar
CREATE POLICY "avatars_insert" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- SELECT: cualquiera puede leer avatares (son públicos)
CREATE POLICY "avatars_select" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

-- UPDATE: solo el propietario puede actualizar su avatar
CREATE POLICY "avatars_update" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- DELETE: solo el propietario puede eliminar su avatar
CREATE POLICY "avatars_delete" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

### Bucket: evidence

**Propósito:** Almacenar fotos que el usuario asocia a sus Commits como evidencia.

**Visibilidad:**

- Lectura: el propietario y los miembros de su Circle
- Escritura: solo el propietario
- Eliminación: solo el propietario

**Nomenclatura:**

```
evidence/{user_id}/{commit_id}/{uuid}.{ext}
```

Ejemplo: `evidence/a1b2c3d4/commit-001/abc-123-def.jpg`

**Políticas RLS:**

```sql
-- INSERT: solo el propietario puede subir evidencia
CREATE POLICY "evidence_insert" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'evidence'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- SELECT: el propietario y su Circle pueden leer
CREATE POLICY "evidence_select_own" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "evidence_select_circle" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'evidence'
        AND EXISTS (
            SELECT 1 FROM circle_memberships
            WHERE user_id = auth.uid()
            AND circle_user_id = (storage.foldername(name))[1]::uuid
            AND status = 'active'
        )
    );

-- DELETE: solo el propietario puede eliminar su evidencia
CREATE POLICY "evidence_delete" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'evidence'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

---

## Tamaños y optimización

| Bucket   | Tamaño máximo | Resolución sugerida | Formato                    |
| -------- | ------------- | ------------------- | -------------------------- |
| avatars  | 5MB           | 256x256 px          | webp (preferido), jpg, png |
| evidence | 20MB          | 1920x1080 max       | webp (preferido), jpg, png |

**Optimización:**

- Las imágenes deben optimizarse en el cliente antes de subir (reducir resolución y convertir a webp).
- El frontend debe mostrar las imágenes con `next/image` para optimización adicional.

---

## Decisiones tomadas

1. **2 buckets en MVP**: avatars y evidence.
2. **Avatares públicos** para que los miembros del Circle puedan ver las fotos sin autenticación adicional.
3. **Evidence privada**: solo el propietario y su Circle pueden ver las fotos.
4. **Nomenclatura con user_id como carpeta raíz** para simplificar las políticas RLS de Storage.
5. **Sin bucket para reflections** en MVP. Las Reflections no incluyen imágenes.

## Alternativas descartadas

- **Bucket único con carpetas por tipo.** Descartado porque las políticas RLS de Storage son por bucket; tener buckets separados simplifica las políticas.
- **Almacenar imágenes en la base de datos (base64).** Descartado por rendimiento y tamaño.
- **Bucket público para evidence.** Descartado porque la evidencia puede ser sensible.

## Riesgos

- Los avatares públicos permiten que cualquier persona con la URL vea la foto. Esto es aceptable porque no hay información sensible.
- La nomenclatura con UUIDs en la ruta puede hacer debugging más complejo.
- Si un usuario sube una imagen de 20MB en evidence, puede consumir almacenamiento rápido. Monitorear.

## Preguntas abiertas

- ¿Debemos optimizar imágenes en el servidor (Edge Function) o en el cliente? Decisión: en el cliente para reducir costes de procesamiento.
- ¿Necesitamos un bucket para "shared learning" en el futuro? Decisión: sí, para v3.

## Próximo documento

`docs/database/07-triggers-functions.md` — Triggers y funciones PostgreSQL necesarias para el MVP.
