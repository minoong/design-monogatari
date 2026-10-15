# Storybook 차량 에셋

이 폴더의 `*.glb`, `studio.hdr`, `g05/` 는 커밋하지 않습니다.

```bash
pnpm --filter @repo/ui copy:car
```

## 사용하는 에셋과 라이선스

| 에셋         | 출처                                                                    | 라이선스  | 비고                                     |
| ------------ | ----------------------------------------------------------------------- | --------- | ---------------------------------------- |
| `g05/`       | BMW Car IT, [X5 G05 (2018)](https://github.com/bmwcarit/digital-car-3d) | CC BY 4.0 | 아래 고지 참고                           |
| `studio.hdr` | Poly Haven `studio_small_08` 1k                                         | CC0       | 앱에는 같은 파일을 커밋합니다 (`NOTICE`) |

**배포 빌드에는 이 폴더를 포함하지 않습니다.** `pnpm --filter @repo/ui build-storybook`은 끝에 `scripts/prune-storybook-models.mjs`를 실행해 `storybook-static/models/`를 지우고, 3D 에셋(`.gltf`, `.glb`, `.fbx`, `.hdr`, `.exr`, `.bin`)이 하나라도 남으면 실패합니다. 로컬에서 `copy:car`로 받은 파일이 있어도 정적 빌드 결과물에는 들어가지 않으며, 배포된 Storybook의 3D 스토리는 모델 없음 안내를 보여줍니다.

EULA로 제한된 모델(예: Volvo)은 쓰지 않습니다. Renault / Plus360 컨피규레이터 메쉬와 Vision M NEXT 프린트 데이터도 넣지 않습니다.

## BMW X5 G05 — CC BY 4.0 고지

CC BY 4.0 §3(a) 요건에 맞춘 고지입니다. Storybook 3D 스토리 화면 하단에도 같은 내용이 표시됩니다. 제작자·원본·라이선스·보증 부인 링크와 "수정됨 · BMW와 무관"은 항상 한 줄로 보이고, 수정 사항과 상표 전문은 '고지 전문' 버튼으로 펼칩니다(`packages/vehicle-3d/src/vehicles.ts`의 `credit`, `src/storybook/scroll-3d/overlay.tsx`의 `VehicleCredit`).

- **제목**: BMW X5 G05 (2018)
- **제작자**: BMW Car IT
- **원본**: <https://github.com/bmwcarit/digital-car-3d>
- **라이선스**: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/) — 전문은 `g05/LICENSE.txt`(`copy:car`가 함께 받습니다)
- **보증 부인**: 모델은 있는 그대로 제공되며 어떤 보증도 없습니다. [CC BY 4.0 §5](https://creativecommons.org/licenses/by/4.0/legalcode#s5) 참고
- **수정 사항**: 반쪽 메시(도어·후드·시트)를 Z축으로 미러링해 조립하고, `*_void`·라이트 이펙트 노드를 숨기고, 앞유리를 투과 처리하고, 크기·방향을 맞췄습니다. 도장 스토리에서는 도장 색도 바꿉니다.
- **상표**: BMW, X5와 BMW 엠블럼은 BMW AG의 상표입니다. 이 프로젝트는 BMW와 제휴·후원 관계가 없으며, 상표권은 CC BY 4.0에 포함되지 않습니다(§2(b)(2)). 엠블럼 메시(`O_G05_Emblem.gltf`)를 쓰고 싶지 않으면 `vehicles.ts`의 `X5_FILES`에서 제외하십시오.

이 repo는 모델 파일을 재배포하지 않습니다. 파일을 커밋하거나 배포 결과물에 포함할 때는 `g05/LICENSE.txt`와 위 고지를 함께 유지해야 합니다.
