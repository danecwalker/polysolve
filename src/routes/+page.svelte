<script lang="ts">
  import { createPiecewiseLinearModel, type Point } from "$lib/polysolve";
  import { curveLinear, extent, line, range, scaleLinear } from "d3";

  let nPoints = $state(5);
  let points = $state<Point[]>(
    Array.from({ length: 5 }, (_, i) => ({
      x: i + 1,
      y: i + 1,
    })),
  );
  let model = $derived(() => {
    return createPiecewiseLinearModel(points);
  });

  let width = $state<number>(0);
  let height = $state<number>(0);

  let xScale = $derived(
    (() => {
      const [min, max] = extent(points, (d) => d.x) as [
        number | undefined,
        number | undefined,
      ];
      return scaleLinear()
        .domain([
          min ?? 0, // default to 0 if undefined
          max ?? 1, // default to 1 if undefined
        ])
        .range([20, width - 20]);
    })(),
  );

  let yScale = $derived(
    (() => {
      const [min, max] = extent(points, (d) => d.y) as [
        number | undefined,
        number | undefined,
      ];
      return scaleLinear()
        .domain([
          min ?? 0, // default to 0 if undefined
          max ?? 1, // default to 1 if undefined
        ])
        .range([height - 20, 20]);
    })(),
  );

  let lineGenerator = $derived(
    line<Point>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(curveLinear),
  );

  let calculatePolynomial = $derived((x: number[]) =>
    x.map((_x) => {
      return {
        x: _x,
        y: model().fit(_x),
      };
    }),
  );

  let testX = $state<number>(1);
  let testYActual = $state<number>(1);
  let showActual = $state<boolean>(false);
  let testY = $derived(model().fit(testX));
</script>

<div class="flex w-full h-screen">
  <section class="p-4 flex-1 flex justify-center items-center">
    <div
      class="w-3/4 aspect-square bg-gray-50 rounded border border-gray-300"
      bind:clientWidth={width}
      bind:clientHeight={height}
    >
      <svg
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" stroke="none">
          {#each points as point}
            <circle
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r="4"
              fill="red"
            />
          {/each}
          <path
            d={lineGenerator(
              calculatePolynomial(
                (() => {
                  const [min, max] = xScale.domain();
                  const step = (max - min) / 1000;
                  return range(min, max, step);
                })(),
              ),
            )}
            stroke="red"
            stroke-width="2"
          />
        </g>

        <g fill="none" stroke="none">
          <circle
            cx={xScale(testX)}
            cy={yScale(testY)}
            r="6"
            class="fill-blue-500"
          />

          {#if showActual}
            <circle
              cx={xScale(testX)}
              cy={yScale(testYActual)}
              r="6"
              class="fill-green-500"
            />
          {/if}
        </g>
      </svg>
    </div>
  </section>

  <section
    class="bg-gray-50 p-4 flex-1 border-l border-gray-300 flex flex-col gap-4"
  >
    <div
      class="flex flex-col gap-4 border border-gray-300 p-4 rounded bg-white"
    >
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-medium">Data</h2>
        <div>
          <input
            class="border border-gray-300 rounded p-2 text-center"
            type="number"
            name="np"
            id="np"
            min="1"
            max="100"
            value={nPoints}
            oninput={(e) => {
              nPoints = parseInt((e.target as HTMLInputElement).value || "0");
              let diff = nPoints - points.length;
              if (diff > 0) {
                points = [
                  ...points,
                  ...Array.from({ length: diff }, (_, i) => ({
                    x: i + points.length + 1,
                    y: i + points.length + 1,
                  })),
                ];
              } else if (diff < 0) {
                points = points.slice(0, nPoints);
              }
            }}
          />
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded"
            onclick={() => {
              points = [...points, { x: nPoints + 1, y: nPoints + 1 }];
              nPoints++;
            }}
          >
            Add Point
          </button>
          <button
            class="bg-red-500 text-white px-4 py-2 rounded"
            onclick={() => {
              points = points.map((point, i) => ({
                x: 0,
                y: 0,
              }));
            }}
          >
            Zero
          </button>
        </div>
      </div>
      <div class="border border-gray-300 rounded overflow-hidden">
        <table class="table-auto w-full text-center">
          <thead>
            <tr class="bg-gray-100 border-b border-gray-300">
              <th class="p-2">x</th>
              <th class="p-2">y</th>
            </tr>
          </thead>
          <tbody>
            {#each points as point}
              <tr>
                <td class="p-2">
                  <input
                    class="w-full text-center p-2 border border-gray-300 rounded"
                    type="text"
                    oninput={(e) => {
                      point.x = parseFloat(
                        (e.target as HTMLInputElement).value || "0",
                      );
                    }}
                    bind:value={point.x}
                  />
                </td>
                <td class="p-2">
                  <input
                    class="w-full text-center p-2 border border-gray-300 rounded"
                    type="text"
                    oninput={(e) => {
                      point.y = parseFloat(
                        (e.target as HTMLInputElement).value || "0",
                      );
                    }}
                    bind:value={point.y}
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    <div
      class="flex flex-col gap-4 border border-gray-300 p-4 rounded bg-white"
    >
      <h2 class="text-2xl font-medium">Result</h2>
      <div
        class="border border-gray-300 rounded overflow-hidden flex flex-col p-2"
      >
        <!-- {#if poly().length > 0}
          {#each poly() as coeff, i}
            <div class="flex gap-1">
              {#if i === 0}
                <span class="text-lg font-medium">{coeff}</span>
              {:else}
                <span class="text-lg text-gray-500 ml-1">+</span>
                <span class="text-lg font-medium">{coeff}</span>
                <span class="text-lg text-gray-500">x<sup>{i}</sup></span>
              {/if}
            </div>
          {/each}
        {:else}
          <p>No polynomial found</p>
        {/if} -->
        {#if model().describe().length > 0}
          {#each model().describe() as v}
            <div class="flex text-lg">
              <span class="text-gray-500">y</span>
              <span class="mx-1">=</span>
              <span class="font-medium">{v.slope}</span>
              <span class="text-gray-500 ml-0.5">x</span>
              <span class="mx-1">+</span>
              <span class="font-medium">{v.intercept}</span>
              <span class="ml-4">for</span>
              <span class="text-gray-500 ml-2">x</span>
              <span class="ml-1">&isinv;</span>
              <span class="mx-1">[</span>
              <span class="font-medium">{v.start.x}</span>
              <span class="text-gray-500 mx-1">,</span>
              <span class="font-medium">{v.end.x}</span>
              <span class="ml-1">]</span>
            </div>
          {/each}
        {:else}
          <p>No fit found</p>
        {/if}
      </div>

      <div
        class="flex flex-col gap-4 border border-gray-300 p-4 rounded bg-white"
      >
        <h2 class="text-2xl font-medium">Solve</h2>
        <div
          class="border border-gray-300 rounded overflow-hidden flex flex-col p-2 gap-2"
        >
          <div class="grid grid-cols-[auto_1fr] gap-2 items-center">
            <label for="test-x" class="text-lg">x</label>
            <input
              class="w-full text-center p-2 border border-gray-300 rounded"
              type="text"
              id="test-x"
              oninput={(e) => {
                testX = parseFloat((e.target as HTMLInputElement).value || "0");
              }}
              bind:value={testX}
            />
            <input
              class="w-full text-center p-2 border border-gray-300 rounded col-start-2"
              type="range"
              id="test-x-s"
              min={xScale.domain()[0]}
              max={xScale.domain()[1]}
              bind:value={testX}
            />
          </div>
          <div class="flex gap-2 items-center">
            <label for="test-y" class="text-lg">y</label>
            <input
              class="w-full text-center p-2 border border-gray-300 rounded"
              type="text"
              id="test-y"
              readonly
              bind:value={testY}
            />
          </div>
          <div class="flex gap-2 items-center">
            <label for="test-y" class="text-lg">Show actual Y</label>
            <input type="checkbox" bind:checked={showActual} />
          </div>
          {#if showActual}
            <div class="flex gap-2 items-center">
              <label for="test-y" class="text-lg">Y</label>
              <input
                class="w-full text-center p-2 border border-gray-300 rounded"
                type="text"
                id="test-y"
                bind:value={testYActual}
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
  }
</style>
