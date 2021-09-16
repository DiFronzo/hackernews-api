DEPLOYCTL=deno run --allow-read --allow-write --allow-net --allow-env --allow-run --no-check 'https://deno.land/x/deploy/deployctl.ts'
# Check TypeScript types.
check:
	$(DEPLOYCTL) check --libs=ns,fetchevent mod.tsx
